export interface TokenUsage {
    count: number;
    timestamp: string;
    model: string;
}

export interface MessageStats {
    sent: number;
    received: number;
    timestamp: string;
}

export interface ModelUsage {
    model: string;
    tokens: number;
    cost: string;
}

export interface AnalyticsData {
    tokenUsage: TokenUsage[];
    messageStats: MessageStats[];
    modelUsage: ModelUsage[];
    totalTokens: number;
    totalCost: string;
    totalMessages: number;
    averageResponseTime: number;
}