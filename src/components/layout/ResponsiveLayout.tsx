import React from 'react';
import MobileContainer from './MobileContainer';
import DesktopLayout from './DesktopLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <>
      <div className="md:hidden">
        <MobileContainer className={className}>{children}</MobileContainer>
      </div>
      <div className="hidden md:block">
        <DesktopLayout className={className}>{children}</DesktopLayout>
      </div>
    </>
  );
};

export default ResponsiveLayout;
