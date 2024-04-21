import { Button, Heading, Separator } from "@radix-ui/themes";
import { useTheme } from "../themeProvider.tsx";
import {GearIcon, GitHubLogoIcon, RocketIcon, SunIcon} from "@radix-ui/react-icons";

export default function NavBar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav>
      <div className="h-[50px] border-b dark:border-white/50 flex bg-secondary/25 justify-between align-center items-center align-middle">
        <div className="pl-10 align-middle flex items-center space-x-3">
          <div className="flex align-middle items-center">
            <RocketIcon width="20" height="20" />
          </div>
          <Separator orientation="vertical" size="2" />
          <div>
            <Heading size="3">Ollama Playground</Heading>
            <Heading weight="light" size="1" className="flex justify-start">
              @nulzo
            </Heading>
          </div>
        </div>
        <div className="pr-10 flex align-center content-center items-center ">
          <div className="pl-4 flex space-x-6">
            <div>
              <Button variant="ghost" color="gray">
                <GearIcon width="20" height="20" />
              </Button>
            </div>
            <div>
              <Button variant="ghost" color="gray">
                <GitHubLogoIcon width="20" height="20"  />
              </Button>
            </div>
            <div>
              <Button variant="ghost" color="gray" onClick={() => (theme === 'light' ? setTheme('dark') : setTheme('light'))}>
                <SunIcon className="text-default" width="20" height="20" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

