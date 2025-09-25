import ModelProviders from "@/providers/public-model-providers";
import Footer from "./_components/footer";
import Navbar from "./_components/navbar";
// import ChatSheet from "@/components/chat/chat-sheet";

type Props = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: Props) => {
  return (
    <div className=" w-full bg-primary/5">
      <Navbar />
      <ModelProviders />
      {/* <ChatSheet /> */}
      {children}
      <Footer />
    </div>
  );
};

export default PublicLayout;
