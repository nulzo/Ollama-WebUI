import { ReactElement } from 'react';

export const ConversationArea = ({ children }: { children: ReactElement }) => (
  <div className="relative flex flex-col justify-between w-[100%] flex-auto overflow-auto h-0 max-w-full z-10 scrollbar-hidden">
    <div className="relative h-full w-full md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl mx-auto">
      {children}
    </div>
  </div>
);
