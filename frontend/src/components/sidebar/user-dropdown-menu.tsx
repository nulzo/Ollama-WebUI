import { LogIn, LogOut, Settings, Settings2, Shield, SquareUser } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ThemeSettings } from '@/features/settings/components/theme-settings.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import avatar from '@/assets/avatar.png';
import { SettingsModal } from '@/features/settings/components/settings-modal.tsx';
import { useSettingsModal } from '@/features/settings/components/use-settings-modal.tsx';
import { useNavigation } from 'react-router-dom';

interface UserDropdownMenuProps {
  children: React.ReactNode;
}

export const UserDropdownMenu = ({ children }: UserDropdownMenuProps) => {
  const { user, isLoading } = useAuth();
  const settingsModal = useSettingsModal();
  const navigate = useNavigation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

        <DropdownMenuContent
          className="z-20 rounded-lg w-[200px]"
          side="right"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <img src={avatar} alt="avatar" className="rounded-lg shrink-0 size-8" />
              <div className="flex-1 grid text-left text-sm leading-tight">
                <span className="font-semibold truncate">
                  {isLoading ? 'Loading...' : user?.username || 'Guest'}
                </span>
                <span className="text-xs truncate">
                  {isLoading ? 'Loading...' : user?.email || 'Guest'}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <ThemeSettings />
            <DropdownMenuItem onSelect={() => settingsModal.onOpen()}>
              <Settings className="mr-1.5 size-3.5" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {user ? (
            <DropdownMenuItem onSelect={() => (window.location.href = '/logout')}>
              <LogOut className="mr-1.5 size-3" /> Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => (window.location.href = '/login')}>
              <LogIn className="mr-1.5 size-3" /> Sign In
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal open={settingsModal.isOpen} onOpenChange={settingsModal.onClose} />
    </>
  );
};
