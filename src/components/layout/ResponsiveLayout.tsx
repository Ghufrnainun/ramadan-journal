import React, { useEffect, useState } from "react";
import MobileContainer from "./MobileContainer";
import DesktopLayout from "./DesktopLayout";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  if (isDesktop) {
    return <DesktopLayout className={className}>{children}</DesktopLayout>;
  }

  return <MobileContainer className={className}>{children}</MobileContainer>;
};

export default ResponsiveLayout;
