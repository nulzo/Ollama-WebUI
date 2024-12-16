export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};

export interface User {
  user_id: number;
  email: string;
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  meta: {
    timestamp: string;
    request_id: string;
    version: string;
  };
  status: number;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  links?: {
    self: string;
    [key: string]: string;
  };
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}
