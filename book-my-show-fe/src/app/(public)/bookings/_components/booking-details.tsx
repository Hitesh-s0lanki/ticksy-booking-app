"use client";

type Props = {};

const BookingDetails = ({}: Props) => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H", "I"],
    ["J", "K", "L"],
  ];

  const fetchshow = async () => {};

  const getoccupiedSeats = async () => {};

  const createBooking = async () => {};

  const handleSeatClick = (seatId: string) => {};

  const renderSeats = (row: string, count = 9) => {
    return (
      <div key={row} className="w-full flex justify-center mb-3">
        <div className="grid grid-cols-9 gap-1 sm:gap-2 md:gap-3">
          {Array.from({ length: count }, (_, i) => {
            const seatId = `${row}${i + 1}`;
            const isSelected = false;
            return (
              <button
                key={seatId}
                onClick={() => handleSeatClick(seatId)}
                className={`aspect-square rounded border border-primary/60 text-xs transition ${"bg-primary text-white"} 
              w-8  @max-xs:w-6 ${"opacity-30"}`}
                title={seatId}
              >
                {seatId}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row px-6 md:px-16 lg:px-24 py-12 mt-30 md:pt-10 max-sm:mt-10">
      <div className="relative flex flex-1 flex-col items-center max-md:mt-15">
        {/* <BlurCircle bottom='-40px' right='0' /> */}
        <h1 className="text-3xl font-semibold mb-7">Select your seat</h1>
        {/* <img src={assets.screenImage} alt="Scrren" /> */}
        <p className="text-sm font-medium">SCREEN SIDE</p>
        <div className="flex flex-col items-center mt-10 w-full text-white font-medium text-xs">
          <div className="w-full">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6 w-full">
            {groupRows.slice(1).map((group, index) => (
              <div key={index} className="flex flex-col items-center w-full">
                {group.map((row) => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-10 max-md:mt-0"></div>
      </div>
      <div className="relative w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max min-xl:sticky xl:top-30 max-xl:mt-0">
        {/* <BlurCircle top='-100px' left='0px' /> */}
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-4 space-y-1"></div>
      </div>
    </div>
  );
};

export default BookingDetails;
