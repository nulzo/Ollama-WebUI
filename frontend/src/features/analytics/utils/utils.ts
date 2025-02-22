export interface AnalyticsResponse {
    usageOverview: Array<{
      date: string;
      tokens: number;
      cost: number;
      messages: number;
    }>;
    messageStats: Array<{
      date: string;
      tokens: number;
      cost: number;
      messages: number;
    }>;
    modelUsage: Array<{
      count: number;
      total_tokens: number;
      total_cost: number;
      data__model: string;
    }>;
    costMetrics: Array<{
      date: string;
      total_cost: number;
      total_tokens: number;
      prompt_tokens: number;
      completion_tokens: number;
      cost_per_token: number;
      efficiency: number;
      tokens_per_dollar: number;
    }>;
    tokenEfficiency: Array<{
      date: string;
      ratio: number;
      efficiency: number;
    }>;
    timeAnalysis: Array<{
      interval: string;
      message_count: number;
      avg_tokens: number;
      avg_response_time: number;
    }>;
    rawEvents: Array<{
      id: string;
      timestamp: string;
      event_type: string;
      data: {
        user_id: number;
        event_type: string;
        model: string;
        tokens: number;
        prompt_tokens: number;
        completion_tokens: number;
        cost: number;
        metadata: {
          conversation_id: string;
          generation_time: number;
          tokens_per_second: number;
        };
      };
    }>;
  }
  
  // Keep existing interfaces but update them to match the new data structure
  export interface TokenUsageData {
    date: string;
    tokens: number;
    cost: number;
    messages: number;
  }
  
  export interface ModelUsageData {
    data__model: string;
    count: number;
    total_tokens: number;
    total_cost: number;
  }
  
  export interface TimeAnalysisData {
    interval: string;
    message_count: number;
    avg_tokens: number;
    avg_response_time: number;
  }
  
  export interface CostMetricsData {
    date: string;
    total_cost: number;
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    cost_per_token: number;
    efficiency: number;
    tokens_per_dollar: number;
  }

export function transformAnalyticsResponse(response: AnalyticsResponse): AnalyticsData {
    const totalTokens = response.costMetrics.reduce((sum: number, metric: any) => sum + metric.total_tokens, 0);
    const totalCost = response.costMetrics.reduce((sum: number, metric: any) => sum + metric.total_cost, 0);
    const totalMessages = response.messageStats.reduce((sum: number, stat: any) => sum + stat.messages, 0);

    const averageResponseTime = response.timeAnalysis.reduce((sum: number, analysis: any) => 
      sum + analysis.avg_response_time, 0) / response.timeAnalysis.length;
  
    return {
      totalTokens,
      totalCost,
      totalMessages,
      averageResponseTime,
      tokenUsage: response.usageOverview.map(usage => ({
        timestamp: usage.date,
        tokens: usage.tokens,
        cost: usage.cost,
        messages: usage.messages
      })),
      modelUsage: response.modelUsage.map(usage => ({
        model: usage.data__model,
        tokens: usage.total_tokens,
        cost: usage.total_cost,
        requests: usage.count,
        errorRate: 0 // Not provided in current API response
      })),
      timeAnalysis: response.timeAnalysis.map(analysis => ({
        hour: new Date(analysis.interval).getHours(),
        day: new Date(analysis.interval).getDay(),
        requests: analysis.message_count,
        tokens: analysis.avg_tokens,
        cost: 0 // Not provided in current time analysis
      })),
      messageStats: response.messageStats.map(stat => ({
        timestamp: stat.date,
        sent: stat.messages,
        received: stat.messages,
        avgResponseTime: response.timeAnalysis.find(
          t => new Date(t.interval).toDateString() === new Date(stat.date).toDateString()
        )?.avg_response_time || 0
      }))
    };
  }