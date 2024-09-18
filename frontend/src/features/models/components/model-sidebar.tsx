import { PanelRightClose, PanelRightOpen, Pen, Pin, SquarePen, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useMemo, useState } from 'react';
import { useModels } from '@/features/models/api/get-models';
import ollama_icon from "@/assets/ollama.svg";

export default function ModelSidebar({ setModel }: { setModel: () => void }) {
    const [isExpanded, setExpanded] = useState<boolean>(true);
    const models = useModels({});

    if (!isExpanded) {
        return (
            <div className={`p-1 transform transition-transform duration-300 h-screen flex justify-between w-fit gap-2 px-4 py-2`}>
                <Button
                    size="icon"
                    variant="ghost"
                    type="submit"
                    className="font-bold mt-1"
                    onClick={() => setExpanded(!isExpanded)}
                >
                    <PanelRightClose className="size-4" />
                </Button>
            </div>
        );
    }
    console.log(models.data);
    return (
        <>
            <div
                className={`max-h-[100dvh] min-h-screen select-none ease-in-out transform transition-transform duration-500 md:relative w-[260px] text-foreground text-sm fixed top-0 left-0 bg-secondary border-r ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex px-2 py-2 w-full ">
                    <div className="flex pt-1 justify-between items-center w-full gap-2 px-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            type="submit"
                            className="font-bold"
                            onClick={() => setExpanded(!isExpanded)}
                        >
                            <PanelRightOpen className="size-4" />
                        </Button>
                    </div>
                </div>
                <div className='px-6 py-2 font-semibold text-large flex gap-2 items-baseline'>
                    <img src={ollama_icon} alt="Ollama" className='h-6' />
                    Local Models
                </div>
                <div className="px-2 font-medium lg:ps-4 overflow-y-scroll scrollbar w-[100%] h-[90vh] max-h-[90vh]">
                    {models.data && models.data?.models?.map(model => (
                        <button
                            key={model.model}
                            value={model.model}
                            className={`truncate w-full flex justify-between rounded-lg px-3 py-2 hover:bg-tertiary`}
                            onClick={() => setModel(model.model)}
                        >
                            <div className="flex self-center flex-1 w-full">
                                <div className="text-left self-center overflow-hidden w-full h-[20px]">
                                    {model.name}
                                </div>
                            </div>
                            <div
                                className={`group-hover:opacity-100 z-0 from-accent absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-gradient-to-l from-80% to-transparent`}
                            >
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
