import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ThemeSettingsModalProps {
  open: boolean;
  onOpenChange: () => void;
}

export const ThemeSettingsModal = ({ open, onOpenChange }: ThemeSettingsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">Theme settings content goes here</div>
      </DialogContent>
    </Dialog>
  );
};
