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
    <div className="min-h-screen bg-slate-950 flex justify-center w-full">
      <div
        className={cn(
          'w-full max-w-[480px] min-h-screen bg-[#020617] relative shadow-2xl overflow-x-hidden',
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
