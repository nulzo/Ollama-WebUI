import { useState } from 'react';
import ModelSidebar from '@/features/models/components/model-sidebar';
import { ModelList } from '@/features/models/components/model-details';

export function ModelsRoute() {
  const [model, setModel] = useState<any>();
  return (
    <>
      <ModelSidebar setModel={setModel} />
      <div className="transition relative w-full max-w-full flex flex-col">
        {/* <ConversationAreaHeader /> */}
        <div className="transition relative flex flex-col flex-auto z-10">
          {model ? <ModelList id={model} /> : null}
          {/* <ConversationArea>
            {searchParamString ? (
              <>
                <MessagesList conversation_id={searchParamString ?? ''} />
                <div ref={ref} />
              </>
            ) : (
              <ConversationDefault />
            )}
          </ConversationArea> */}
          <div className="pb-4 pt-4 z-[99] transition">
            <div className="-mb-3.5 mx-auto inset-x-0 bg-transparent flex justify-center">
              <div className="mx-auto flex flex-col max-w-4xl justify-center px-2.5 md:px-6 w-full">
                <div className=" flex justify-center">
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    {model}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
