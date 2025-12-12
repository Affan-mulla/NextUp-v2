import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="py-6 px-8 w-full h-full">
      <div className="flex flex-col h-full w-full">
        <h1 className="text-2xl font-semibold font-outfit">Settings</h1>
        {children}
      </div>
    </div>
  );
};

export default layout;
