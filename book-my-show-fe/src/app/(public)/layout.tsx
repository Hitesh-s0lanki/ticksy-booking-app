import ModelProviders from "@/providers/model-providers";
import Footer from "./_components/footer";
import Navbar from "./_components/navbar";

type Props = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: Props) => {
  return (
    <div className=" w-full bg-primary/5">
      <Navbar />
      <ModelProviders />
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
