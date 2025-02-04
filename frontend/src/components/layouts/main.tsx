import { ReactElement } from 'react';

interface ContentAreaProps {
  children: ReactElement;
}

export const ContentArea = ({ children }: ContentAreaProps) => (
  <div className="relative z-10 flex flex-col flex-auto justify-between scrollbar-hidden w-[100%] max-w-full h-0 overflow-auto">
    <div className="relative mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl h-full">
      {children}
    </div>
  </div>
);