import React from "react";
import Sidebar from "./Sidebar";

interface DesktopLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div className="flex min-h-dvh bg-[#020617] text-slate-200">
      <Sidebar />
      <main className="flex-1 md:pl-64 w-full">
        <div className={className}>{children}</div>
      </main>
    </div>
  );
};

export default DesktopLayout;
