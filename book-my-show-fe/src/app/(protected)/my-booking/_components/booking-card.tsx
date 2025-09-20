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

  return (
    <Card className="overflow-hidden py-3">
      <CardContent className="p-0 px-4">
        <div className="flex">
          {/* fixed aspect-ratio container for the poster */}
          <div className="relative w-32 h-48 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={booking.image}
              alt={booking.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{booking.title}</h3>
                <Badge className="mt-1">
                  {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">₹{booking.amount}</p>
                <p className="text-xs text-gray-500">
                  Booking ID: {booking.bookingId}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {booking.date} • {booking.time}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{booking.venue}</span>
              </div>
              <div className="flex items-center">
                <Ticket className="w-4 h-4 mr-2" />
                <span>Seats: {booking.seats.join(", ")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onOpen(booking.qr, {
                    type: "image",
                    title: "Booking QR Code",
                  })
                }
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onOpen(booking.pdf, { type: "pdf", title: "Booking Ticket" })
                }
              >
                <Download className="w-4 h-4 mr-2" />
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
