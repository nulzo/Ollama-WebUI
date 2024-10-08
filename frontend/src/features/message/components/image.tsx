import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export const Image = ({ src }: { src: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img src={src} className="h-[250px] mb-2 hover:cursor-zoom-in rounded-bl-xl rounded-t-xl" />
      </DialogTrigger>
      <DialogContent className="w-fit h-fit rounded-lg p-0 m-0">
        <img src={src} className="bg-cover rounded-lg" />
      </DialogContent>
    </Dialog>
  );
};
