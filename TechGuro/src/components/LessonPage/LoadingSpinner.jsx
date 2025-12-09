//LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ message = "Naglo-load..." }) => {
  return (
    <div className="bg-[#DFDFEE] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4C5173] mb-4"></div>
        <p className="text-lg font-semibold text-[#4C5173]">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;