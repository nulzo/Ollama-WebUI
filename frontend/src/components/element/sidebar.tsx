import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { AlignJustify, ArrowUpDown, Bot, ChevronLeft, ChevronsUpDown, Image, LogIn, LogOut, PanelRightClose, PanelRightOpen, Plus, Settings, Settings2, SquareUser } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield } from 'lucide-react'
import { ChevronRight, Server } from 'lucide-react'; // Add these imports
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSettings, useProviderSettings } from '@/features/settings/api/get-settings';

interface ProviderSettings {
  apiKey: string;
  endpoint?: string;
  organizationId?: string;
  modelOptions?: string[];
}

const providers = {
  ollama: {
    name: 'Ollama',
    icon: Server,
    settings: {
      endpoint: 'http://localhost:11434',
      modelOptions: ['llama2', 'mistral', 'codellama']
    }
  },
  openai: {
    name: 'OpenAI',
    icon: Server,
    settings: {
      apiKey: '',
      organizationId: '',
      modelOptions: ['gpt-4', 'gpt-3.5-turbo']
    }
  },
  azure: {
    name: 'Azure AI',
    icon: Server,
    settings: {
      apiKey: '',
      endpoint: '',
      modelOptions: ['gpt-4', 'gpt-35-turbo']
    }
  },
  anthropic: {
    name: 'Anthropic',
    icon: Server,
    settings: {
      apiKey: '',
      modelOptions: ['claude-3-opus', 'claude-3-sonnet']
    }
  }
};

type ProviderType = 'ollama' | 'openai' | 'azure' | 'anthropic';

interface SidebarProps {
  conversationList?: React.ReactNode;
  actions?: React.ReactNode;
}

const Sidebar = ({ conversationList, actions }: SidebarProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user, isLoading } = useAuth();
  const animationDuration = 0.2;
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedSetting, setSelectedSetting] = useState('general');
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [isProvidersExpanded, setIsProvidersExpanded] = useState(false);
  const { data: providerSettings } = useProviderSettings();

  const MIN_WIDTH = 57;
  const MAX_WIDTH = 250;

  // Setup motion values
  const width = useMotionValue(isCollapsed ? MIN_WIDTH : MAX_WIDTH);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOpenModal = (modal: string) => {
    setOpenModal(modal)
  }

  const handleCloseModal = () => {
    setOpenModal(null)
  }

  return (
    <motion.div
      className="left-0 z-[100] fixed inset-y-0 sidebar-container"
      initial={false}
      animate={{
        width: isCollapsed ? MIN_WIDTH : MAX_WIDTH
      }}
      style={{
        width: width
      }}
      transition={{
        duration: animationDuration,
        ease: "easeInOut"
      }}
    >
      <div className="relative flex flex-col bg-secondary border-r h-svh overflow-hidden">
        {/* Top Section */}
        <div className="relative flex items-center mt-2 p-2 pb-1 h-12 align-middle">

          <span className='flex items-center gap-1 px-1 w-full font-semibold text-foreground text-lg'>
            <motion.div
              className="left-4 absolute"
              animate={{
                opacity: isCollapsed ? 0 : 1
              }}
              transition={{
                duration: animationDuration,
                ease: "easeInOut"
              }}
            >
              <CringeLogo className="select-none shrink-0 size-6 stroke-foreground" />
            </motion.div>

            <motion.div
              className="left-2 absolute w-full"  // Changed to left-3 to match other buttons
              initial={{ opacity: 0 }}
              animate={{
                opacity: isCollapsed ? 1 : 0
              }}
              transition={{
                duration: animationDuration,
                ease: "easeInOut",
                delay: isCollapsed ? animationDuration : 0
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="relative flex justify-center items-center w-10 h-9 font-bold text-sm group"
              >
                <PanelRightClose className='size-4 stroke-foreground' />
              </Button>
            </motion.div>

            <div className='flex justify-between items-center gap-1 ml-8 w-full'>
              <motion.div
                className='flex items-center gap-1 text-foreground text-nowrap overflow-hidden select-none'
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
                <span className='font-light text-primary text-xs'>beta</span>
              </motion.div>

              <motion.div
                animate={{
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{
                  duration: animationDuration,
                  ease: "easeInOut"
                }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="relative flex justify-center items-center w-10 h-9 font-bold text-sm group"
                >
                  <PanelRightOpen className='size-4 stroke-foreground' />
                </Button>
              </motion.div>
            </div>
          </span>
        </div>


        {/* Main Content Area - Flex Column with Full Height */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Action Buttons */}
          <div className="p-2">
            {/* New Chat Button */}
            {!isCollapsed && (
              <div className="flex justify-center items-center w-full">
                <Button
                  variant="default"
                  size="icon"
                  className="relative flex justify-center items-center gap-2.5 mb-2 px-2 w-full h-9 font-bold text-sm group"
                  onClick={() => { navigate('/') }}
                >
                  <div className="flex justify-center items-center">
                    {/* <Plus className="shrink-0 size-4" /> */}
                    <motion.span
                      className="ml-2 text-sm whitespace-nowrap overflow-hidden"
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
              </div>
            )}


            {isCollapsed && (
              <Button
                variant="default"
                size="icon"
                className="relative flex justify-center gap-2.5 mb-2 w-full h-9 font-bold text-center text-sm group"
                onClick={() => { navigate('/') }}
              >
                <div className="left-3 absolute flex justify-center items-center">
                  <Plus className="shrink-0 size-4" />
                  <motion.span
                    className="justify-center ml-2 text-center text-sm whitespace-nowrap overflow-hidden"
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
            )}

            {/* Explore Agents Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm group"
              onClick={() => { navigate('/models') }}
            >
              <div className="left-3 absolute flex items-center">
                <Bot className="size-4" />
                <motion.span
                  className="ml-2 text-sm whitespace-nowrap overflow-hidden"
                  animate={{
                    width: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{
                    duration: animationDuration,
                    ease: "easeInOut"
                  }}
                >
                  Fine-Tune Agents
                </motion.span>
              </div>
            </Button>

            {/* Download Models Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm group"
              onClick={() => { navigate('/cloud') }}
            >
              <div className="left-3 absolute flex items-center">
                <ArrowUpDown className="size-4" />
                <motion.span
                  className="ml-2 text-sm whitespace-nowrap overflow-hidden"
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

            {/* Download Models Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm group"
              onClick={() => { navigate('/diffusion') }}
            >
              <div className="left-3 absolute flex items-center">
                <Image className="size-4" />
                <motion.span
                  className="ml-2 text-sm whitespace-nowrap overflow-hidden"
                  animate={{
                    width: isCollapsed ? 0 : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                  }}
                  transition={{
                    duration: animationDuration,
                    ease: "easeInOut"
                  }}
                >
                  Image Generation
                </motion.span>
              </div>
            </Button>

            {/* Search Bar */}
            <div className={`flex items-center px-3 gap-2.5 w-full ${!isCollapsed ? 'opacity-100' : 'hidden'}`}>
              <MagnifyingGlassIcon className="size-4 stroke-muted-foreground" />
              <Input
                className="border-0 focus-within:border-0 focus:border-0 bg-transparent px-0 hover:ring-0 focus-visible:ring-0 focus-within:ring-0 focus:ring-0 w-[75%] focus:outline-none"
                placeholder="Search"
              />
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div className={`flex-1 overflow-y-auto min-h-0 p-2 ${!isCollapsed ? 'opacity-100' : 'opacity-0'}`}>
            {conversationList}
          </div>

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
                      <img src={avatar} alt="avatar" className='rounded-lg shrink-0 size-8' />
                      <motion.div
                        className="flex flex-1 justify-between items-center m-2"
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
                          <span className='flex justify-start font-semibold text-sm truncate whitespace-nowrap'>
                            {isLoading ? 'Loading...' : user?.username || 'Guest'}
                          </span>
                          <span className='flex justify-start font-normal text-xs truncate whitespace-nowrap'>
                            {isLoading ? 'Loading...' : user?.email || 'Guest'}
                          </span>
                        </div>
                        <ChevronsUpDown className='mr-2 shrink-0 size-3' />
                      </motion.div>
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="z-20 rounded-lg w-[200px]"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <img src={avatar} alt="avatar" className='rounded-lg shrink-0 size-8' />
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
                    <DropdownMenuItem onSelect={() => handleOpenModal('settings')}>
                      <Settings className='mr-1.5 size-3' /> Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleOpenModal('profile')}>
                      <SquareUser className='mr-1.5 size-3' /> Profile
                      <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {user && (
                    <DropdownMenuItem>
                      <LogOut className='mr-1.5 size-3' /> Log out
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                  {!user && (
                    <DropdownMenuItem>
                      <LogIn className='mr-1.5 size-3' /> Sign In
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </div>
      <Dialog open={openModal === 'theme'} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Theme Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4">Theme settings content goes here</div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === 'settings'} onOpenChange={handleCloseModal}>
        <DialogContent className="gap-0 p-0 sm:max-w-[825px]">
          <div className="flex h-[600px]">
            {/* Settings Sidebar */}
            <div className="bg-secondary border-r border-border w-[200px] shrink-0">
              <DialogHeader className="p-4 pb-2">
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-1 p-2">
                <Button
                  variant={selectedSetting === 'general' ? "secondary" : "ghost"}
                  className="justify-start gap-2"
                  onClick={() => {
                    setSelectedSetting('general');
                    setSelectedProvider(null);
                  }}
                >
                  <Settings2 className="size-4" />
                  General
                </Button>
                <Collapsible
                  open={isProvidersExpanded}
                  onOpenChange={setIsProvidersExpanded}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={selectedSetting === 'providers' ? "secondary" : "ghost"}
                      className="justify-between w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Server className="size-4" />
                        Providers
                      </div>
                      <ChevronRight className={`size-4 transition-transform ${isProvidersExpanded ? 'rotate-90' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    {Object.entries(providers).map(([key, provider]) => (
                      <Button
                        key={key}
                        variant={selectedProvider === key ? "secondary" : "ghost"}
                        className="justify-start gap-2 w-full"
                        onClick={() => {
                          setSelectedSetting('providers');
                          setSelectedProvider(key as ProviderType);
                        }}
                      >
                        <provider.icon className="size-4" />
                        {provider.name}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
                <Button
                  variant={selectedSetting === 'privacy' ? "secondary" : "ghost"}
                  className="justify-start gap-2"
                  onClick={() => {
                    setSelectedSetting('privacy');
                    setSelectedProvider(null);
                  }}
                >
                  <Shield className="size-4" />
                  Privacy
                </Button>

                <Button
                  variant={selectedSetting === 'admin' ? "secondary" : "ghost"}
                  className="justify-start gap-2"
                  onClick={() => {
                    setSelectedSetting('admin');
                    setSelectedProvider(null);
                  }}
                >
                  <Settings className="size-4" />
                  Admin
                </Button>

              </div>
            </div>
            {/* Content Area */}
            <div className="flex flex-col w-full h-full">
              <div className="flex-1 p-8 overflow-y-auto">
                {selectedSetting === 'general' && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <Label>Theme</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Default Model</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                          <SelectItem value="llama2">Llama 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Language</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Timezone</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {selectedSetting === 'providers' && selectedProvider && (
                  <div className="space-y-6">
                    {providerSettings?.map((provider) => (
                      provider.provider_type === selectedProvider && (
                        <div key={provider.id} className="space-y-4">
                          <h2 className="font-semibold text-lg">{providers[provider.provider_type].name} Settings</h2>
                          {/* Provider specific settings */}
                          <div className="space-y-1">
                            <Label>Endpoint</Label>
                            <Input
                              placeholder="Enter endpoint URL"
                              defaultValue={provider.endpoint}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>API Key</Label>
                            <Input
                              placeholder="Enter API key"
                              defaultValue={provider.api_key}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <Label>Enable Provider</Label>
                            <Switch defaultChecked={provider.is_enabled} />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-background p-4 border-t border-border">
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Handle settings update
                      console.log('Updating settings...');
                      handleCloseModal();
                    }}
                  >
                    Update Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openModal === 'profile'} onOpenChange={handleCloseModal}>
        <DialogContent className="gap-0 p-12 sm:max-w-[825px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="gap-4 grid py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Avatar</Button>
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about yourself" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <Select>
                <SelectTrigger id="expertise">
                  <SelectValue placeholder="Select areas of expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">Artificial Intelligence</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="nlp">Natural Language Processing</SelectItem>
                  <SelectItem value="cv">Computer Vision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="preferred-models">Preferred Models</Label>
              <Select>
                <SelectTrigger id="preferred-models">
                  <SelectValue placeholder="Select preferred models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-2">Claude 2</SelectItem>
                  <SelectItem value="palm">PaLM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center">
              <Label htmlFor="public-profile">Make profile public</Label>
              <Switch id="public-profile" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Sidebar;

