import { useTheme } from "../theme-provider.tsx";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import SettingsModal from "../modals/settings.tsx";
import { useState } from "react";
import { Button } from "../ui/button.tsx";

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [section, setSection] = useState("profile");
  return (
    <div className="flex justify-between w-full">
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentSection={section}
      />
      <Menubar className="border-none">
        <MenubarMenu>
          <MenubarTrigger className="font-bold">CringeUI</MenubarTrigger>
          <MenubarContent>
            <a href="https://github.com/nulzo/Ollama-WebUI">
              <MenubarItem>Source Code</MenubarItem>
            </a>
            <MenubarItem>Documentation</MenubarItem>
            <MenubarItem>Credits</MenubarItem>
            <MenubarSeparator />
            <span className="text-xs text-muted-foreground flex px-2 py-1">
              version 0.0.1
            </span>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              New Window <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>New Incognito Window</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Share</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Email link</MenubarItem>
                <MenubarItem>Messages</MenubarItem>
                <MenubarItem>Notes</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              Print... <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Find</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Search the web</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Find...</MenubarItem>
                <MenubarItem>Find Next</MenubarItem>
                <MenubarItem>Find Previous</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Toggle Fullscreen</MenubarItem>
            <MenubarItem>Hide Sidebar</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Services</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Ollama...</MenubarItem>
            <MenubarItem>OpenAI...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Theme</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarRadioGroup value={theme}>
                  <MenubarRadioItem
                    value="dark"
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </MenubarRadioItem>
                  <MenubarRadioItem
                    value="light"
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </MenubarRadioItem>
                  <MenubarRadioItem
                    value="system"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </MenubarRadioItem>
                </MenubarRadioGroup>
                <MenubarSeparator />
                <MenubarItem>Edit theme...</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Profiles</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Profile 1</MenubarItem>
                <MenubarItem>Light Mode</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Add Profile...</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => {
                setSection("settings");
                setSettingsOpen(true);
              }}
            >
              Edit settings...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Button
        variant="outline"
        className="size-8 mx-4 mt-0.5"
        size="icon"
        aria-label="NulzoGithub"
      >
        <a href="https://github.com/nulzo/">
          <img
            className="rounded-xl"
            src="https://avatars.githubusercontent.com/u/65730528?v=4"
            alt="nulzo"
          />
        </a>
      </Button>
    </div>
  );
}
