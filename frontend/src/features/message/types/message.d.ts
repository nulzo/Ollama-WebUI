export interface Message {
  id: ?string;
  conversation?: string;
  username?: string;
  message?: string;
  isBot?: boolean;
  isTyping?: boolean;
  time?: string;
}
