import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ticket } from "lucide-react";
import { pastBookings, upcomingBookings } from "@/lib/data";
import BookingCard from "./booking-card";

type Props = {};

const MyBookingDetails = ({}: Props) => {
  return (
    <div className="px-20 py-8 flex justify-center items-center w-full">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          My Bookings
        </h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Bookings ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6 mt-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isUpcoming={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Upcoming Bookings
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any upcoming bookings.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6 mt-6">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isUpcoming={false}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No Past Bookings
                  </h3>
                  <p className="text-gray-600">
                    You haven't made any bookings yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBookingDetails;
