import { motion } from 'framer-motion';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { UserDropdownMenu } from '@/features/sidebar/components/user-dropdown-menu';
import avatar from '@/assets/avatar.png';

interface SidebarUserSectionProps {
  isCollapsed: boolean;
  animationDuration: number;
}

export const SidebarUserSection = ({ isCollapsed, animationDuration }: SidebarUserSectionProps) => {
  const { user, isLoading } = useAuth();

  return (
    <div className="p-2 border-t border-border">
      <motion.div
        className="w-full"
        transition={{
          duration: animationDuration,
          ease: 'easeInOut',
        }}
      >
        <UserDropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className={`relative h-12 w-full overflow-hidden ${!isCollapsed && 'px-2'}`}
          >
            <motion.div
              className="absolute inset-0 flex items-center"
              initial={false}
              animate={{
                justifyContent: 'flex-start',
                paddingLeft: '0.5rem',
              }}
              transition={{
                duration: animationDuration,
                ease: 'easeInOut',
              }}
            >
              <img src={avatar} alt="avatar" className="rounded-lg shrink-0 size-8" />
              <motion.div
                className="flex flex-1 justify-between items-center m-2"
                animate={{
                  width: isCollapsed ? 0 : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{
                  duration: animationDuration,
                  ease: 'easeInOut',
                }}
                style={{
                  originX: 0,
                }}
              >
                <div className="flex flex-col justify-start w-full">
                  <span className="flex justify-start font-semibold text-sm truncate whitespace-nowrap">
                    {isLoading ? 'Loading...' : user?.username || 'Guest'}
                  </span>
                  <span className="flex justify-start font-normal text-xs truncate whitespace-nowrap">
                    {isLoading ? 'Loading...' : user?.email || 'Guest'}
                  </span>
                </div>
                <ChevronsUpDown className="mr-2 shrink-0 size-3" />
              </motion.div>
            </motion.div>
          </Button>
        </UserDropdownMenu>
      </motion.div>
    </div>
  );
};
