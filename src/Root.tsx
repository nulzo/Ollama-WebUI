import Sidebar from "./components/Sidebar.tsx";
import ChatPage from "./pages/chat.tsx";

export default function Root() {

  return (
    <div className="grid h-screen w-full pl-[60px]">
      <Sidebar/>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl pl-2 font-semibold">Nulzo's Ollama WebUI</h1>
        </header>
      </div>
      <ChatPage />
    </div>
  );
}
