import { CalendarCheck, Clock } from "lucide-react";

type Props = {
  date?: string; // e.g. "2025-09-17"
  startAt?: string; // e.g. "18:30"
  endAt?: string; // e.g. "21:15"
};

const ShowtimeDetail = ({ date, startAt, endAt }: Props) => {
  const start = new Date(startAt || "");
  const end = new Date(endAt || "");

  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const durationMs = end.getTime() - start.getTime();
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  const durationText =
    durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins}m`;

  return (
    <div className="bg-background border border-primary/20 rounded-xl p-5 shadow-sm flex flex-col gap-3 w-full justify-center items-center">
      <div className="flex items-center justify-center w-full gap-2">
        <CalendarCheck className="h-5 w-5 text-gray-500" />
        <span className="text-lg font-medium text-gray-700">{date}</span>
      </div>

      <div className="flex items-center gap-2 text-lg  text-gray-900">
        <Clock className="h-5 w-5 text-gray-500" /> {startTime} - {endTime} (
        {durationText})
      </div>
    </div>
  );
};

export default ShowtimeDetail;
