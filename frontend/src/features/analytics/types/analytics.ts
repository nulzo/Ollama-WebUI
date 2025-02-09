export interface EventMetadata {
  conversation_id: string;
  generation_time: number;
  tokens_per_second: number;
}

export interface RawEvent {
  timestamp: string;
  model: string;
  cost: number;
  tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  metadata: EventMetadata;
}

export interface TokenUsage {
  timestamp: string;
  count: number;
  model: string;
}

export interface UsageOverview {
  timestamp: string;
  tokens: number;
  cost: number;
  messages: number;
}

export interface ModelUsage {
  model: string;
  tokens: number;
  cost: number;
}

export interface TimeAnalysis {
  hour: number;
  requests: number;
  tokens: number;
  cost: number;
}

export interface MessageStats {
  timestamp: string;
  sent: number;
  received: number;
}

export interface AnalyticsData {
  totalTokens: number;
  totalCost: number;
  totalMessages: number;
  averageResponseTime: number;
  tokenUsage: TokenUsage[];
  usageOverview: UsageOverview[];
  modelUsage: ModelUsage[];
  timeAnalysis: TimeAnalysis[];
  messageStats: MessageStats[];
  rawEvents: RawEvent[];
}
