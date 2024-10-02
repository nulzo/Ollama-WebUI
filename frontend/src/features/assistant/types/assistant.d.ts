export interface Assistant {
  id: number;
  name: string;
  display_name: string;
  icon: string | null;
  description: string | null;
  api_key: string | null;
  default_temperature: number;
  default_max_tokens: number;
  created_at: string; // ISO date string
}
