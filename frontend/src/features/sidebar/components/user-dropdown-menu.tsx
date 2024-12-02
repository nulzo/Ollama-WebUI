import { LogIn, LogOut, Settings, Shield, SquareUser } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { ThemeSettings } from '@/features/settings/components/theme-settings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import avatar from '@/assets/avatar.png';

interface UserDropdownMenuProps {
  children: React.ReactNode;
}

export const UserDropdownMenu = ({ children }: UserDropdownMenuProps) => {
  const { user, isLoading } = useAuth();

  return (
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
          <DropdownMenuItem onSelect={() => (window.location.href = '/settings')}>
            <Settings className="mr-1.5 size-3" /> Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => (window.location.href = '/profile')}>
            <SquareUser className="mr-1.5 size-3" /> Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => (window.location.href = '/privacy')}>
            <Shield className="mr-1.5 size-3" /> Privacy
            <DropdownMenuShortcut>⇧⌘V</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {user ? (
          <DropdownMenuItem
            onSelect={() => {
              /* handle logout */
            }}
          >
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
  );
};
