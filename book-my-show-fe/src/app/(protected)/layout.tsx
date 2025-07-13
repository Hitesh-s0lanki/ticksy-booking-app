import Footer from "./_components/footer";
import Navbar from "./_components/navbar";

type Props = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default PrivateLayout;
