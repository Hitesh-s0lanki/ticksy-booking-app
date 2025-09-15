import BookingDetails from "../_components/booking-details";

type Props = {
  params: Promise<{
    showtimeId: string;
  }>;
};

const BookingPage = async ({ params }: Props) => {
  const { showtimeId } = await params;
  return <BookingDetails showtimeId={showtimeId} />;
};

export default BookingPage;
