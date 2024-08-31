import { SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button.tsx";
import { ModelSelect } from "@/features/models/components/model-select.tsx";

export function Header() {
  return (
    <div className="sticky py-2.5 top-0 flex flex-row z-10 grow-0 px-4 gap-3 justify-between items-center col-span-4 w-full rounded-b-none bg-background h-14">
      <div className="flex items-center gap-3 font-semibold text-lg ps-4">
        <ModelSelect />
      </div>
      <div className="flex items-center gap-1 pe-6">
        <Button size="icon" variant="ghost">
          <SlidersHorizontal className="size-4" strokeWidth="1.5" />
        </Button>
      </div>
    </div>
  );
}
