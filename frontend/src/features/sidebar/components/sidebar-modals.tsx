import { useState } from 'react';
import { ThemeSettingsModal } from '@/features/sidebar/components/modals/theme-settings-modal';
import { UserSettingsModal } from '@/features/sidebar/components/modals/user-settings-modal';
import { UserProfileModal } from '@/features/sidebar/components/modals/user-profile-modal';

export type ModalType = 'theme' | 'settings' | 'profile' | null;

export const SidebarModals = () => {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const handleCloseModal = () => setOpenModal(null);

  return (
    <>
      <ThemeSettingsModal 
        open={openModal === 'theme'} 
        onOpenChange={handleCloseModal} 
      />
      
      <UserSettingsModal 
        open={openModal === 'settings'} 
        onOpenChange={handleCloseModal} 
      />
      
      <UserProfileModal 
        open={openModal === 'profile'} 
        onOpenChange={handleCloseModal} 
      />
    </>
  );
};