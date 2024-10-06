interface Route {
  endpoint?: string;
  isProtected?: boolean;
  requiresLogout?: boolean;
}

export const CHAT_ROUTE: Route = {
  endpoint: '/chat',
  isProtected: true,
  requiresLogout: false
};

export const MODELS_ROUTE: Route = {
  endpoint: '/models',
  isProtected: true,
  requiresLogout: false
};

export const CLOUD_ROUTE: Route = {
  endpoint: '/store',
  isProtected: true,
  requiresLogout: false
}
