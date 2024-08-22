import Sidebar from "@/components/elements/sidebar.tsx";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="grid w-full pl-[53px] h-screen">
      <Sidebar />
      <div className="flex flex-col h-[95%] max-h-[95%]">
        <Outlet />
      </div>
    </div>
  );
}
