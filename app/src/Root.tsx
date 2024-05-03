import { ChatPage } from "@/pages/chat-page";
import Sidebar from "@/components/elements/sidebar.tsx";
import NavBar from "@/components/elements/navbar.tsx";

export default function Root() {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <NavBar />
        </header>
        <ChatPage />
      </div>
    </div>
  );
}
