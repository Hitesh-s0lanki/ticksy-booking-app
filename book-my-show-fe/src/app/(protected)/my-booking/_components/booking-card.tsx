import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@/types/booking.types";
import { Calendar, MapPin, Ticket, Download, QrCode } from "lucide-react";
import Image from "next/image";

type Props = {
  booking: Booking;
  isUpcoming: boolean;
};

const BookingCard = ({ booking, isUpcoming }: Props) => (
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
                {new Date(booking.date).toLocaleDateString()} • {booking.time}
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
            {isUpcoming ? (
              <>
                <Button size="sm" variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BookingCard;
