import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="min-h-dvh bg-slate-950 flex justify-center w-full">
      <div
        className={cn(
          'w-full md:max-w-5xl lg:max-w-7xl min-h-dvh bg-[#020617] relative shadow-2xl overflow-x-hidden transition-colors duration-300',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileContainer;
