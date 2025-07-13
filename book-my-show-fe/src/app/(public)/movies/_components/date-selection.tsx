"use client";

import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "@/components/ui/kibo-ui/mini-calendar";
import { generateDates } from "@/lib/utils";
import { useState } from "react";

type Props = {};

const DataSelection = ({}: Props) => {
  //   const [selectedDate, setSelectedDate] = useState(
  //     new Date().toISOString().slice(0, 10)
  //   );
  //   const dates = generateDates();

  return (
    <div className="mb-6 w-full flex flex-col justify-center items-center">
      <h3 className="font-semibold mb-3 ">Select Date</h3>
      <div className="w-1/2 flex justify-center items-center">
        <MiniCalendar>
          <MiniCalendarNavigation direction="prev" />
          <MiniCalendarDays>
            {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
          </MiniCalendarDays>
          <MiniCalendarNavigation direction="next" />
        </MiniCalendar>
      </div>
    </div>
  );
};

export default DataSelection;
