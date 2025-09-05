const fs = require("fs");
const path = require("path");
const axios = require("axios");

// helper utils
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

const pad2 = (n) => String(n).padStart(2, "0");
const formatLocalDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const formatLocalDateTime = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

/**
 * Make a Date at local midnight + minutes offset
 */
const dateAtMinutes = (baseDate, minutesFromMidnight) => {
  const d = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    0,
    0,
    0,
    0
  );
  d.setMinutes(minutesFromMidnight);
  return d;
};

/**
 * Check if [s1,e1) overlaps [s2,e2)
 */
const overlaps = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

/**
 * Attempt to place a show (start,end in minutes) into a venue/day schedule without overlap
 */
const tryPlaceShow = (dayKey, scheduleMap, startMin, endMin) => {
  const slots = scheduleMap.get(dayKey) || [];
  for (const slot of slots) {
    if (overlaps(startMin, endMin, slot.start, slot.end)) return false;
  }
  slots.push({ start: startMin, end: endMin });
  // keep slots sorted (not required, but nice)
  slots.sort((a, b) => a.start - b.start);
  scheduleMap.set(dayKey, slots);
  return true;
};

// function to create a showtime randomly using the movies and venues data
async function createShowtimes() {
  try {
    const movies = await axios
      .get("http://localhost:8080/api/movies")
      .then((res) => res.data);
    const venues = await axios
      .get("http://localhost:8080/api/venues?venueType=CINEMA")
      .then((res) => res.data);

    const cinemaVenues = venues.filter(
      (v) => v.venueType?.toUpperCase?.() === "CINEMA"
    );
    const usableVenues = cinemaVenues.length ? cinemaVenues : venues;

    if (!movies?.length || !usableVenues?.length) {
      console.warn("No movies or venues available to schedule.");
      return [];
    }

    const showtimes = [];

    // Per-venue-per-day schedule to avoid overlaps: key = `${venueId}|${date}`
    const scheduleMap = new Map();

    const today = new Date(); // local TZ
    const DAYS = 50;

    // time window & constraints
    const BUFFER_MINS = 15; // cleanup time between shows
    const EARLIEST_MIN = 10 * 60; // 10:00
    const LATEST_END_MIN = 23 * 60 + 30; // 23:30 last end time
    const STEP = 15; // times in 15-min increments
    const ATTEMPTS_PER_SHOW = 60; // attempts to place one show
    const MIN_SHOWS_PER_MOVIE = 2;
    const MAX_SHOWS_PER_MOVIE = 5;
    const MIN_SHOWS_PER_VENUE = 3;
    const MAX_SHOWS_PER_VENUE = 5;

    // Pre-extract ids & durations for speed
    const movieMeta = movies
      .map((m) => ({
        id: m.movieId || m.id || m.uuid,
        duration:
          Number(m.durationMins ?? m.duration_mins ?? m.duration) || 120,
      }))
      .filter((m) => m.id);

    const venueMeta = usableVenues
      .map((v) => ({ id: v.venueId || v.id || v.uuid }))
      .filter((v) => v.id);

    for (let dayOffset = 0; dayOffset < DAYS; dayOffset++) {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + dayOffset
      );
      const dayStr = formatLocalDate(day);

      // ---- build movie targets (2..5 each) ----
      const movieTargets = new Map();
      movieMeta.forEach((m) =>
        movieTargets.set(
          m.id,
          randInt(MIN_SHOWS_PER_MOVIE, MAX_SHOWS_PER_MOVIE)
        )
      );
      let totalMovieNeeded = [...movieTargets.values()].reduce(
        (a, b) => a + b,
        0
      );

      // ---- build venue capacities (3..5 each) ----
      const venueTargets = new Map();
      venueMeta.forEach((v) =>
        venueTargets.set(
          v.id,
          randInt(MIN_SHOWS_PER_VENUE, MAX_SHOWS_PER_VENUE)
        )
      );
      let totalVenueCapacity = [...venueTargets.values()].reduce(
        (a, b) => a + b,
        0
      );

      // Balance: make totals match as best as possible
      if (totalVenueCapacity < 2 * movieMeta.length) {
        console.warn(
          `[${dayStr}] Capacity (${totalVenueCapacity}) < movies minimum (${
            2 * movieMeta.length
          }). Will underfill some movies.`
        );
      }
      // If movie demand > capacity, scale down movie targets (never below 0)
      if (totalMovieNeeded > totalVenueCapacity) {
        let toTrim = totalMovieNeeded - totalVenueCapacity;
        // Greedy trim from movies with highest targets first, but try to keep as many >=2 as possible
        const sorted = [...movieTargets.entries()].sort((a, b) => b[1] - a[1]);
        for (const [mid, tgt] of sorted) {
          if (toTrim <= 0) break;
          const minAllowed = 1; // fallback lower bound when infeasible
          const canReduce = Math.max(0, tgt - minAllowed);
          if (canReduce > 0) {
            const cut = Math.min(canReduce, toTrim);
            movieTargets.set(mid, tgt - cut);
            toTrim -= cut;
          }
        }
      } else if (totalMovieNeeded < totalVenueCapacity) {
        // If capacity > demand, distribute extra to movies up to max 5
        let extra = totalVenueCapacity - totalMovieNeeded;
        const ids = [...movieTargets.keys()];
        let i = 0;
        while (extra > 0 && i < 10000) {
          const mid = ids[i % ids.length];
          const cur = movieTargets.get(mid);
          if (cur < MAX_SHOWS_PER_MOVIE) {
            movieTargets.set(mid, cur + 1);
            extra--;
          }
          i++;
        }
      }

      // Remaining to place per movie
      const movieRemaining = new Map(movieTargets);

      // Place shows venue by venue
      for (const venue of venueMeta) {
        const venueId = venue.id;
        const dayKeyBase = `${venueId}|${dayStr}`;
        let toPlaceHere = venueTargets.get(venueId) || 0;

        let safety = 0;
        while (toPlaceHere > 0 && safety < 5000) {
          safety++;

          // pick a movie with highest remaining > 0
          const candidates = [...movieRemaining.entries()]
            .filter(([, left]) => left > 0)
            .sort((a, b) => b[1] - a[1]);
          if (!candidates.length) break;

          const [movieId] = candidates[0];
          const meta = movieMeta.find((m) => m.id === movieId);
          const totalMins = meta.duration + BUFFER_MINS;

          const LATEST_START_MIN = Math.max(
            EARLIEST_MIN,
            LATEST_END_MIN - totalMins
          );
          if (LATEST_START_MIN < EARLIEST_MIN) {
            // too long to fit at all today
            movieRemaining.set(movieId, 0);
            continue;
          }

          let placed = false;
          for (
            let attempt = 0;
            attempt < ATTEMPTS_PER_SHOW && !placed;
            attempt++
          ) {
            const dayKey = dayKeyBase;
            const startMin =
              Math.floor(randInt(EARLIEST_MIN, LATEST_START_MIN) / STEP) * STEP;
            const endMin = startMin + totalMins;

            if (tryPlaceShow(dayKey, scheduleMap, startMin, endMin)) {
              const startAt = dateAtMinutes(day, startMin);
              const endAt = dateAtMinutes(day, endMin);

              showtimes.push({
                venueId,
                movieId,
                date: dayStr, // LocalDate on backend
                startAt: formatLocalDateTime(startAt),
                endAt: formatLocalDateTime(endAt),
              });

              // one less required for this movie & venue slot consumed
              movieRemaining.set(movieId, movieRemaining.get(movieId) - 1);
              toPlaceHere--;
              placed = true;
            }
          }

          // Couldn’t place this movie at this venue (time collisions). Try next best movie.
          if (!placed) {
            // Temporarily deprioritize this movie by moving it to end with same remaining
            const rest = candidates.slice(1);
            let switched = false;
            for (const [altId] of rest) {
              const altMeta = movieMeta.find((m) => m.id === altId);
              const totalAlt = altMeta.duration + BUFFER_MINS;
              const LATEST_START_ALT = Math.max(
                EARLIEST_MIN,
                LATEST_END_MIN - totalAlt
              );
              if (LATEST_START_ALT < EARLIEST_MIN) continue;

              let placedAlt = false;
              for (
                let attempt = 0;
                attempt < ATTEMPTS_PER_SHOW && !placedAlt;
                attempt++
              ) {
                const startMin =
                  Math.floor(randInt(EARLIEST_MIN, LATEST_START_ALT) / STEP) *
                  STEP;
                const endMin = startMin + totalAlt;

                if (tryPlaceShow(dayKeyBase, scheduleMap, startMin, endMin)) {
                  const startAt = dateAtMinutes(day, startMin);
                  const endAt = dateAtMinutes(day, endMin);

                  showtimes.push({
                    venueId,
                    movieId: altId,
                    date: dayStr,
                    startAt: formatLocalDateTime(startAt),
                    endAt: formatLocalDateTime(endAt),
                  });

                  movieRemaining.set(altId, movieRemaining.get(altId) - 1);
                  toPlaceHere--;
                  placedAlt = true;
                  switched = true;
                }
              }
              if (placedAlt) break;
            }
            if (!switched) {
              // give up on this venue slot after many tries to avoid infinite loops
              break;
            }
          }
        }

        // If we couldn't meet MIN_SHOWS_PER_VENUE, log it
        const placedHere = scheduleMap.get(`${venueId}|${dayStr}`)?.length ?? 0;
        if (placedHere < MIN_SHOWS_PER_VENUE) {
          console.warn(
            `[${dayStr}] Venue ${venueId} placed ${placedHere}, below min ${MIN_SHOWS_PER_VENUE} (time window / collisions).`
          );
        }
      }

      // Post-check: any movies below 2 shows? (best-effort warning)
      for (const [mid, left] of movieRemaining) {
        const planned = movieTargets.get(mid);
        const placed = planned - left;
        if (placed < MIN_SHOWS_PER_MOVIE) {
          console.warn(
            `[${dayStr}] Movie ${mid} placed ${placed}, below min ${MIN_SHOWS_PER_MOVIE} (capacity/time constraints).`
          );
        }
      }
    }

    // Persist to file (or POST to backend if you add that here)
    const results = showtimes;
    const filePath = path.join(__dirname, "showtimes.json");
    try {
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2), "utf-8");
      console.log(`Wrote ${results.length} showtimes to ${filePath}`);
    } catch (e) {
      console.error("Failed to write showtimes to file:", e.message);
    }

    console.log(`Created ${results.length} showtimes over next ${DAYS} days.`);
    return results;
  } catch (error) {
    console.error("Error creating showtimes:", error);
    return [];
  }
}

createShowtimes();
