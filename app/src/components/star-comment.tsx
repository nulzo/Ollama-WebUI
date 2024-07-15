import { Star } from "lucide-react";

export default function StarBox() {
  return (
    <div className="h-[100px] p-4 items-center flex flex-col text-center justify-center rounded-lg border-primary/50 border-2 bg-primary/5">
      <div className="flex font-semibold text-sm align-middle gap-1 mb-2 justify-center items-center">
        Don't forget to give me a star! <Star className="size-3" />
      </div>
      <div className="flex flex-col text-xs align-middle gap-1 justify-center items-center">
        <div className="flex">
          I am just kidding. Don't do that... Touch grass instead
        </div>
      </div>
    </div>
  );
}
