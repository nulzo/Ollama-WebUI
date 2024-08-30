interface Route {
    url?: string;
    location?: string;
}

export const CHAT_ROUTE: Route = {
    url: "/chat",
    location: "@/routes/chat-page"
}

export const MODELS_ROUTE: string = "/models";

export const CLOUD_ROUTE: string = "/store";
