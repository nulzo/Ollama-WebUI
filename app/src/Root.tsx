import Sidebar from "@/components/elements/sidebar.tsx";
import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="h-screen max-h-[100dvh] overflow-auto flex flex-row">
      <Sidebar />
      <Outlet />
    </div>
  );
}
