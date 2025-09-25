import EyeTracking from "./not-found/eye-tracking";

const NoDataFound = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full w-full  py-20">
      {/* Logo */}

      <EyeTracking />

      {/* Page Not Found Text */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          No relevant data found
        </h2>
        <p className="text-gray-500 mb-8">
          We couldn't find any results that match your criteria.
        </p>
      </div>
    </div>
  );
};

export default NoDataFound;
