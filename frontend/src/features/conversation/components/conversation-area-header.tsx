import { MoonIcon, SlidersHorizontal, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { ModelSelect } from "@/features/models/components/model-select.tsx";
import { useTheme } from "@/components/theme/theme-provider.tsx";

export function ConversationAreaHeader() {
    const { theme, setTheme } = useTheme();
    return (
        <div className="sticky py-2.5 top-0 flex flex-row z-10 grow-0 px-4 gap-3 justify-between items-center col-span-4 w-full rounded-b-none bg-background h-14">
            <div className="flex items-center gap-3 font-semibold text-lg ps-4">
                <ModelSelect />
            </div>
            <div className="flex items-center gap-1 pe-6">
                <Button size="icon" variant="ghost">
                    <SlidersHorizontal className="size-4" strokeWidth="1.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => (theme === 'light' ? setTheme('dark') : setTheme('light'))}>
                    {theme === 'dark' ? <MoonIcon className="size-4" strokeWidth="1.5" /> : <SunIcon className="size-4" strokeWidth="1.5" />}
                </Button>
            </div>
        </div>
    );
}
