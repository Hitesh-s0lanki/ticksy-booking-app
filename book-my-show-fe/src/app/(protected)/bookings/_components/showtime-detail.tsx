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
    <div className="bg-background border border-primary/20 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-2 sm:gap-3 w-full justify-center items-center">
      <div className="flex items-center justify-center w-full gap-2">
        <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
        <span className="text-base sm:text-lg font-medium text-gray-700 text-center">{date}</span>
      </div>

      <div className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-gray-900 flex-wrap justify-center">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" /> 
        <span>{startTime} - {endTime} ({durationText})</span>
      </div>
    </div>
  );
};

export default ShowtimeDetail;
