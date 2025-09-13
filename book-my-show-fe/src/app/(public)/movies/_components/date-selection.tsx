"use client";

import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/ui/kibo-ui/mini-calendar";

type Props = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const DataSelection = ({ selectedDate, setSelectedDate }: Props) => {
  return (
    <div className="mb-6 w-full flex flex-col justify-center items-center">
      <h3 className="font-semibold mb-3 ">Select Date</h3>
      <div className="w-1/2 flex justify-center items-center">
        <div className="space-y-4">
          <MiniCalendar
            onValueChange={(date) => {
              if (date) setSelectedDate(date);
            }}
            value={selectedDate}
          >
            <MiniCalendarNavigation
              direction="prev"
              disabled={
                selectedDate < new Date() ||
                selectedDate < new Date("1900-01-01")
              }
            />
            <MiniCalendarDays>
              {(date) => (
                <MiniCalendarDay date={date} key={date.toISOString()} />
              )}
            </MiniCalendarDays>
            <MiniCalendarNavigation direction="next" />
          </MiniCalendar>
          {selectedDate && (
            <p className="text-muted-foreground text-sm text-center">
              Selected:{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSelection;
