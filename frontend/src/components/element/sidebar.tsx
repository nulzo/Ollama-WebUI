import { motion } from 'framer-motion';
import { ArrowUpDown, Bot, ChevronsUpDown, LogIn, LogOut, PanelRightClose, PanelRightOpen, Plus, Settings, Settings2, SquareUser } from 'lucide-react';
import { Button } from '../ui/button';
import { CringeLogo } from '@/assets/cringelogo';
import { useSidebar } from '@/features/sidebar/components/sidebar-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import avatar from "@/assets/avatar.png"
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { Input } from '../ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { ThemeSettings } from '@/features/settings/components/theme-settings';

interface SidebarProps {
  conversationList?: React.ReactNode;
  actions?: React.ReactNode;
}

const Sidebar = ({ conversationList, actions }: SidebarProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user, isLoading } = useAuth();
  const animationDuration = 0.2;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      className="sidebar-container fixed inset-y-0 left-0 z-[50]"
      animate={{
        width: isCollapsed ? '55px' : '250px'
      }}
      transition={{
        duration: animationDuration,
        ease: "easeInOut"
      }}
    >
      <div className="bg-secondary border-alpha-200 h-svh flex flex-col overflow-hidden border-r">
        {/* Top Section */}
        <div className="flex items-center p-2 mt-2 relative pb-1">
          <div className={`flex items-center gap-2.5 ${!isCollapsed ? 'justify-start w-[80%]' : 'justify-center w-full'}`}>
            <Button variant="default" className="relative w-full h-9">
              <div className="absolute left-2 flex items-center">
                <CringeLogo className="stroke-primary-foreground size-6 shrink-0" />
                <motion.div
                  className="ml-2 flex items-center text-xs overflow-hidden whitespace-nowrap"
                  animate={{
                    width: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{
                    duration: animationDuration,
                    ease: "easeInOut"
                  }}
                >
                  CringeAI
                  <span className='text-xs font-light ml-1'>beta</span>
                </motion.div>
              </div>
            </Button>
          </div>
          <div className="flex-1"></div>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <PanelRightOpen className='size-4' />
            </Button>
          )}
        </div>

        {/* Main Content Area - Flex Column with Full Height */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Action Buttons */}
          <div className="p-2">
            {/* New Chat Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-full justify-start flex gap-2.5 text-sm group h-9 font-normal"
            >
              <div className="absolute left-3 flex items-center">
                <Plus className="size-4 shrink-0" />
                <motion.span
                  className="ml-2 text-sm overflow-hidden whitespace-nowrap"
                  animate={{
                    width: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{
                    duration: animationDuration,
                    ease: "easeInOut"
                  }}
                >
                  New Chat
                </motion.span>
              </div>
            </Button>

            {/* Explore Agents Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-full justify-start flex gap-2.5 text-sm group h-9 font-normal"
            >
              <div className="absolute left-3 flex items-center">
                <Bot className="size-4" />
                <motion.span
                  className="ml-2 text-sm overflow-hidden whitespace-nowrap"
                  animate={{
                    width: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{
                    duration: animationDuration,
                    ease: "easeInOut"
                  }}
                >
                  Explore Agents
                </motion.span>
              </div>
            </Button>

            {/* Download Models Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative w-full justify-start flex gap-2.5 text-sm group h-9 font-normal"
            >
              <div className="absolute left-3 flex items-center">
                <ArrowUpDown className="size-4" />
                <motion.span
                  className="ml-2 text-sm overflow-hidden whitespace-nowrap"
                  animate={{
                    width: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{
                    duration: animationDuration,
                    ease: "easeInOut"
                  }}
                >
                  Download Models
                </motion.span>
              </div>
            </Button>

            {/* Search Bar */}
            <div className={`flex items-center px-3 gap-2.5 w-full ${!isCollapsed ? 'opacity-100' : 'hidden'}`}>
              <MagnifyingGlassIcon className="stroke-muted-foreground size-4" />
              <Input
                className="w-[75%] focus-visible:ring-0 border-0 bg-transparent px-0 hover:ring-0 focus-within:ring-0 focus-within:border-0 focus:ring-0 focus:outline-none focus:border-0"
                placeholder="Search"
              />
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div className={`flex-1 overflow-y-auto min-h-0 p-2 ${!isCollapsed ? 'opacity-100' : 'hidden'}`}>
            {conversationList}
          </div>

          {/* Collapse Button (when collapsed) */}
          {isCollapsed && (
            <div className="p-2 mt-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
              >
                <PanelRightClose className='size-4' />
              </Button>
            </div>
          )}

          {/* User Section - Fixed at Bottom */}
          <div className="p-2 border-t border-border">
            <motion.div
              className="w-full"
              transition={{
                duration: animationDuration,
                ease: "easeInOut"
              }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                        ease: "easeInOut"
                      }}
                    >
                      <img src={avatar} alt="avatar" className='size-8 shrink-0 rounded-lg' />
                      <motion.div
                        className="flex items-center justify-between flex-1 m-2"
                        animate={{
                          width: isCollapsed ? 0 : 'auto',
                          opacity: isCollapsed ? 0 : 1,
                        }}
                        transition={{
                          duration: animationDuration,
                          ease: "easeInOut"
                        }}
                        style={{
                          originX: 0,
                        }}
                      >
                        <div className='flex flex-col justify-start w-full'>
                          <span className='whitespace-nowrap justify-start font-semibold flex text-sm truncate'>
                            {isLoading ? 'Loading...' : user?.username || 'Guest'}
                          </span>
                          <span className='whitespace-nowrap justify-start flex font-normal text-xs truncate'>
                            {isLoading ? 'Loading...' : user?.email || 'Guest'}
                          </span>
                        </div>
                        <ChevronsUpDown className='size-3 shrink-0 mr-2' />
                      </motion.div>
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[200px] rounded-lg z-[5000]"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <img src={avatar} alt="avatar" className='size-8 shrink-0 rounded-lg' />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {isLoading ? 'Loading...' : user?.username || 'Guest'}
                        </span>
                        <span className="truncate text-xs">
                          {isLoading ? 'Loading...' : user?.email || 'Guest'}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <ThemeSettings />
                    <DropdownMenuItem>
                      <Settings className='size-3 mr-1.5' /> Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SquareUser className='size-3 mr-1.5' /> Profile
                      <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {user && (
                    <DropdownMenuItem>
                      <LogOut className='size-3 mr-1.5' /> Log out
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                  {!user && (
                    <DropdownMenuItem>
                      <LogIn className='size-3 mr-1.5' /> Sign In
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;

