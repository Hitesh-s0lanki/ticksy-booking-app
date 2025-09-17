type Props = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen justify-center items-center bg-primary/10">
      {children}
    </div>
  );
};

export default AuthLayout;
