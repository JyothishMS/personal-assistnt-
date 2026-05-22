import dotenv from "dotenv";

dotenv.config();

export type AIProvider = "Claude" | "ChatGPT" | "Gemini" | "Perplexity" | "Ollama";
export type TaskType = "CODING" | "REASONING" | "MULTIMODAL" | "RESEARCH" | "OFFLINE" | "GENERAL";

export interface ProximaResponse {
  aggregatedResult: string;
  providersUsed: AIProvider[];
  taskType: TaskType;
  success: boolean;
  metrics: {
    retries: number;
    durationMs: number;
  };
}

export class ProximaOrchestrator {
  private activeConcurrency = 0;
  private maxConcurrency = 5;

  // 1. Task Type Detection & Intent Classification
  public determineTaskType(query: string, options?: { forceOffline?: boolean }): { type: TaskType; providers: AIProvider[] } {
    if (options?.forceOffline) {
      return { type: "OFFLINE", providers: ["Ollama"] };
    }

    const q = query.toLowerCase();
    
    // Perplexity -> Live Web Research
    if (q.includes("research") || q.includes("search the web") || q.includes("live data") || q.includes("latest news") || q.includes("find online")) {
      // In a real scenario we'd use Perplexity + ChatGPT 
      return { type: "RESEARCH", providers: ["Perplexity", "ChatGPT"] };
    }
    
    // Claude -> Coding, Architecture, Debugging
    if (q.includes("code") || q.includes("debug") || q.includes("script") || q.includes("error") || q.includes("architect")) {
      return { type: "CODING", providers: ["Claude"] };
    }
    
    // Gemini -> Multimodal/Contextual
    if (q.includes("image") || q.includes("vision") || q.includes("context") || q.includes("look at this")) {
      return { type: "MULTIMODAL", providers: ["Gemini"] };
    }

    // ChatGPT -> Reasoning, Planning, Synthesis
    if (q.includes("plan") || q.includes("synthesize") || q.includes("think") || q.includes("reasoning") || q.includes("why")) {
      return { type: "REASONING", providers: ["ChatGPT"] };
    }
    
    // Default to local/offline or general synthesis
    return { type: "GENERAL", providers: ["Ollama"] };
  }

  // 2. Reliable Provider Execution with Fallbacks and Timeout
  private async executeWithProvider(provider: AIProvider, query: string, retries = 2): Promise<string> {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        // Mocking execution logic using a timeout wrapped fetch or API call
        return await this.mockProviderCall(provider, query);
      } catch (err) {
        attempt++;
        console.warn(`[Proxima] ${provider} execution failed, retrying... (${attempt}/${retries})`);
        if (attempt > retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * attempt)); // exponential backoff
      }
    }
    throw new Error(`${provider} failed after retries`);
  }

  private async mockProviderCall(provider: AIProvider, query: string): Promise<string> {
    // Simulated delays and responses per provider for demonstration
    await new Promise(r => setTimeout(r, Math.random() * 800 + 400));
    
    switch (provider) {
      case "Claude":
        return `[Claude v3.5-Sonnet]: Generated optimized code blocks resolving syntax logic.`;
      case "ChatGPT":
        return `[ChatGPT-4o]: Synthesized strategic plan involving 4 key architectural steps.`;
      case "Gemini":
        return `[Gemini 1.5 Pro]: Interpreted contextual multi-modal references spanning system layout.`;
      case "Perplexity":
        return `[Perplexity]: Extracted 6 live citations from up-to-date web intelligence.`;
      case "Ollama":
        return `[Ollama/Llama3 Local]: Computed offline fallback response safely inside sandbox.`;
      default:
        return `[${provider}]: Processed query.`;
    }
  }

  // 3. Centralized Orchestration, Concurrency, and Aggregation
  public async orchestrate(query: string, options?: { forceOffline?: boolean }): Promise<ProximaResponse> {
    const startTime = Date.now();
    const { type, providers } = this.determineTaskType(query, options);
    
    if (this.activeConcurrency >= this.maxConcurrency) {
      // Simulate request queuing
      console.warn("[Proxima] High concurrency, queuing request...");
      await new Promise(r => setTimeout(r, 1500));
    }
    
    this.activeConcurrency++;
    const results: string[] = [];
    let success = true;

    try {
      // Multi-model parallel routing
      const executionPromises = providers.map(p => this.executeWithProvider(p, query));
      
      const settled = await Promise.allSettled(executionPromises);
      
      settled.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          results.push(res.value);
        } else {
          console.error(`[Proxima] Provider ${providers[i]} failed. Initiating fallback routing...`);
          results.push(`[Proxima Fallback]: Provider ${providers[i]} was unavailable (timeout/error).`);
        }
      });
      
    } catch (err) {
      console.error("[Proxima Orchestration Error]", err);
      success = false;
    } finally {
      this.activeConcurrency--;
    }

    // 4. Unified Response Aggregation (Merging outputs)
    const aggregatedResult = results.length > 1 
      ? `[Proxima Aggregator] Synthesized intelligence from multiple models:\n\n` + results.join('\n\n')
      : results[0] || "[Proxima Aggregator Error] No response generated.";

    return {
      aggregatedResult,
      providersUsed: providers,
      taskType: type,
      success,
      metrics: {
        retries: 0,
        durationMs: Date.now() - startTime
      }
    };
  }
}

export const proxima = new ProximaOrchestrator();
