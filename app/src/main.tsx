import ReactDOM from "react-dom/client";
import "./style/output.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider.tsx";
import Root from "./Root.tsx";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ModelPage from "./pages/model-page";
import { ChatPage } from "@/pages/chat-page";
import { Routes, Route, BrowserRouter } from "react-router-dom";

const queryClient: QueryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ReactQueryDevtools />
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Root />}>
            <Route index element={<ChatPage />} />
            <Route path="models" element={<ModelPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);
