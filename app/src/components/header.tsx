import { SlidersHorizontal } from "lucide-react";
import LoadModels from "./load-models";
import SettingsModal from "./settings-modal";
import { Button } from "./ui/button";

export function Header({ model, setModel }: {model: string, setModel: (x: string) => void}) {
  return (
    <div className="sticky py-2.5 top-0 flex flex-row z-10 grow-0 px-4 gap-3 justify-between items-center col-span-4 w-full rounded-b-none bg-background h-14">
      <div className="flex items-center gap-3 font-semibold text-lg ps-4">
        <LoadModels updateModel={setModel} currentModel={model} />
      </div>
      <div className="flex items-center gap-1 pe-6">
        <SettingsModal currentModel={model} updateModel={setModel} />
        <Button size="icon" variant="ghost">
          <SlidersHorizontal className="size-4" strokeWidth="1.5" />
        </Button>
      </div>
    </div>
  );
}
