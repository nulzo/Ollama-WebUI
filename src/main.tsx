import ReactDOM from "react-dom/client";
import "./style/output.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/themeProvider";
import Root from "./Root.tsx";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient: QueryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ReactQueryDevtools initialIsOpen={false} />
      <Theme appearance="dark" accentColor="indigo" grayColor="slate" radius="small">
        <Root />
      </Theme>
    </ThemeProvider>
  </QueryClientProvider>
);
