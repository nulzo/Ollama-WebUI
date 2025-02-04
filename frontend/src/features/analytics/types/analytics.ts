export interface AnalyticsData {
    tokenUsage: TokenUsageData[];
    messageStats: MessageStatsData[];
    modelUsage: ModelUsageData[];
    timeAnalysis: TimeAnalysisData[];
    totalTokens: number;
    totalCost: number;
    totalMessages: number;
    averageResponseTime: number;
}

export interface TokenUsageData {
    timestamp: string;
    promptTokens: number;
    completionTokens: number;
    model: string;
    cost: number;
    count: number;
}

export interface MessageStatsData {
    timestamp: string;
    sent: number;
    received: number;
    avgResponseTime: number;
}

export interface ModelUsageData {
    model: string;
    tokens: number;
    cost: number;
    requests: number;
    errorRate: number;
}

export interface TimeAnalysisData {
    hour: number;
    day: number;
    requests: number;
    tokens: number;
    cost: number;
}