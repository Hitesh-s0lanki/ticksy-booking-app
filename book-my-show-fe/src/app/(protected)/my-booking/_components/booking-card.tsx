import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MyBooking } from "@/gen/js-ts/booking_pb";
import { usePreviewDialog } from "@/modules/booking/hooks/use-preview-dialog";
import { PlainMessage } from "@bufbuild/protobuf";
import { Calendar, MapPin, Ticket, Download, QrCode } from "lucide-react";
import Image from "next/image";

type Props = {
  booking: PlainMessage<MyBooking>;
  isUpcoming: boolean;
};

const BookingCard = ({ booking }: Props) => {
  const { onOpen } = usePreviewDialog();
  
  // Use logo as fallback if image is not available
  const imageSrc = booking.image && booking.image.trim() !== "" 
    ? booking.image 
    : "/logo.png";

  return (
    <Card className="overflow-hidden py-2 sm:py-3">
      <CardContent className="p-0 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* fixed aspect-ratio container for the poster */}
          <div className="relative w-full sm:w-32 h-48 sm:h-48 flex-shrink-0 overflow-hidden rounded-lg mx-auto sm:mx-0 bg-muted">
            <Image
              src={imageSrc}
              alt={booking.title}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                // Fallback to logo if image fails to load
                const target = e.target as HTMLImageElement;
                if (target.src !== "/logo.png") {
                  target.src = "/logo.png";
                }
              }}
            />
          </div>

          <div className="flex-1 p-2 sm:p-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg truncate">{booking.title}</h3>
                <Badge className="mt-1 text-xs">
                  {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                </Badge>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="font-semibold text-base sm:text-lg">₹{booking.amount}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 break-all">
                  ID: {booking.bookingId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-1 text-xs sm:text-sm text-gray-600 mb-3">
              <div className="flex items-start sm:items-center">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                <span className="break-words">
                  {booking.date} • {booking.time}
                </span>
              </div>
              <div className="flex items-start sm:items-center">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                <span className="break-words">{booking.venue}</span>
              </div>
              <div className="flex items-start sm:items-center">
                <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                <span className="break-words">Seats: {booking.seats.join(", ")}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto text-xs sm:text-sm"
                onClick={() =>
                  onOpen(booking.qr, {
                    type: "image",
                    title: "Booking QR Code",
                  })
                }
              >
                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Show QR
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto text-xs sm:text-sm"
                onClick={() =>
                  onOpen(booking.pdf, { type: "pdf", title: "Booking Ticket" })
                }
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
