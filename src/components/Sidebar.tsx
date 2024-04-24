import {IconButton, Tooltip} from "@radix-ui/themes";
import {IconBook, IconCloudDownload, IconEdit, IconListDetails, IconMessage, IconSettings} from "@tabler/icons-react";

export default function Sidebar() {
    return (
        <aside className="inset-y w-[60px] justify-center fixed left-0 z-20 flex h-full flex-col border-r">
            <nav className="grid justify-center gap-6 p-2 pt-[75px]">
                <Tooltip content="Chat" side="right" sideOffset={10} delayDuration={250}>
                    <IconButton variant="ghost" radius="large">
                        <IconMessage/>
                    </IconButton>
                </Tooltip>
                <Tooltip content="Detailed Chat" side="right" sideOffset={10} delayDuration={250}>
                    <IconButton variant="ghost" radius="large">
                        <IconListDetails/>
                    </IconButton>
                </Tooltip>
                <Tooltip content="Edit Models" side="right" sideOffset={10} delayDuration={250}>
                    <IconButton variant="ghost" radius="large">
                        <IconEdit/>
                    </IconButton>
                </Tooltip>
                <Tooltip className="flex justify-center" content="Pull Models" side="right" sideOffset={10}
                         delayDuration={250}>
                    <IconButton variant="ghost" radius="large">
                        <IconCloudDownload/>
                    </IconButton>
                </Tooltip>
                <Tooltip content="Resources" side="right" sideOffset={10} delayDuration={250}>
                    <IconButton variant="ghost" radius="large">
                        <IconBook/>
                    </IconButton>
                </Tooltip>
            </nav>
            <nav className="mt-auto justify-center grid gap-1 pb-4 p-2">
                <Tooltip content="settings" side="right" sideOffset={10} delayDuration={250}>
                    <IconButton variant="ghost" radius="large">
                        <IconSettings/>
                    </IconButton>
                </Tooltip>
            </nav>
        </aside>
    )
}