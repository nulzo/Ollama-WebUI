import { ReactElement } from 'react';

interface ConversationAreaProps {
  children: ReactElement;
}

export const ConversationArea = ({ children }: ConversationAreaProps) => (
  <div className="relative z-10 flex flex-col flex-auto w-full max-w-full h-full">
    <div className="relative mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl h-full">
      {children}
    </div>
  </div>
);
