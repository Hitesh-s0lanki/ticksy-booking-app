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
      .get("http://localhost:8080/api/venues")
      .then((res) => res.data);

    // Prefer cinema venues if a type flag exists; otherwise use all
    const cinemaVenues = venues.filter(
      (v) =>
        v.venueType?.toUpperCase?.() === "CINEMA" ||
        v.venueType?.toUpperCase?.() === "CINEMA"
    );
    const usableVenues = cinemaVenues.length ? cinemaVenues : venues;

    if (!movies?.length || !usableVenues?.length) {
      console.warn("No movies or venues available to schedule.");
      return [];
    }

    const showtimes = [];

    // Keep track of per-venue, per-day schedules to avoid overlaps: key = `${venueId}|${date}`
    const scheduleMap = new Map();
    // Track per-day cap (max 5 showtimes/day across all venues)
    const perDayCount = new Map();

    const today = new Date(); // local TZ
    const DAYS = 50;
    const MAX_PER_DAY = 5;
    const BUFFER_MINS = 15; // cleanup time between shows
    const EARLIEST_MIN = 10 * 60; // 10:00
    const LATEST_END_MIN = 23 * 60 + 30; // 23:30 last end time
    const STEP = 15; // times in 15-min increments
    const ATTEMPTS_PER_SHOW = 25;

    for (let dayOffset = 0; dayOffset < DAYS; dayOffset++) {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + dayOffset
      );
      const dayStr = formatLocalDate(day);

      // Decide how many shows to try today (1..MAX_PER_DAY), but don't exceed the cap
      const remainingToday = MAX_PER_DAY - (perDayCount.get(dayStr) || 0);
      if (remainingToday <= 0) continue;
      const showsTodayTarget = randInt(1, remainingToday);

      for (let k = 0; k < showsTodayTarget; k++) {
        const movie = pick(movies);
        const venue = pick(usableVenues);

        // Access UUIDs from API payloads (adjust keys if your API uses different names)
        const movieId = movie.movieId || movie.id || movie.uuid;
        const venueId = venue.venueId || venue.id || venue.uuid;
        if (!movieId || !venueId) continue;

        const duration =
          Number(movie.durationMins ?? movie.duration_mins ?? movie.duration) ||
          120;
        const totalMins = duration + BUFFER_MINS;

        // Latest possible start time so that film + buffer ends by LATEST_END_MIN
        const LATEST_START_MIN = Math.max(
          EARLIEST_MIN,
          LATEST_END_MIN - totalMins
        );
        if (LATEST_START_MIN < EARLIEST_MIN) continue; // can't fit today

        const dayKey = `${venueId}|${dayStr}`;
        let placed = false;

        for (
          let attempt = 0;
          attempt < ATTEMPTS_PER_SHOW && !placed;
          attempt++
        ) {
          // random start in 15-min steps
          const startMin =
            Math.floor(randInt(EARLIEST_MIN, LATEST_START_MIN) / STEP) * STEP;
          const endMin = startMin + totalMins;

          // Ensure no overlap at this venue on this day
          if (tryPlaceShow(dayKey, scheduleMap, startMin, endMin)) {
            const startAt = dateAtMinutes(day, startMin);
            const endAt = dateAtMinutes(day, endMin);

            const payload = {
              // If your API expects nested objects, replace with:
              // venue: { venueId }, movie: { movieId },
              venueId,
              movieId,
              date: dayStr, // LocalDate in backend
              startAt: formatLocalDateTime(startAt), // LocalDateTime in backend
              endAt: formatLocalDateTime(endAt),
            };

            showtimes.push(payload);
            placed = true;
          }
        }
      }

      // update per-day count
      const curr = perDayCount.get(dayStr) || 0;
      perDayCount.set(dayStr, curr + (scheduleMap.has(dayStr) ? 0 : 0)); // (map is keyed by venue/day)
      // Actually count the number of showtimes we added for this date:
      const addedToday =
        showtimes.filter((st) => st.date === dayStr).length - curr;
      perDayCount.set(dayStr, (perDayCount.get(dayStr) || 0) + addedToday);
    }

    // Persist to backend (POST each). If you have a bulk endpoint, use that instead.
    const results = showtimes;
    const filePath = path.join(__dirname, "showtime.json");
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
