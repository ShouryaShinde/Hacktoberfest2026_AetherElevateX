import { BaseLlmProvider } from '../base.provider.js';
import config from '../../config/index.js';
import { ModelProviderError, ModelTimeoutError } from '../../utils/errors.js';

export class GemmaProvider extends BaseLlmProvider {
  constructor(options = {}) {
    super();
    this.baseUrl = options.baseUrl !== undefined ? options.baseUrl : config.gemmaBaseUrl;
    this.apiKey = options.apiKey !== undefined ? options.apiKey : config.gemmaApiKey;
    this.modelId = options.modelId !== undefined ? options.modelId : config.gemmaModelId;
    this.timeoutMs = options.timeoutMs !== undefined ? options.timeoutMs : config.gemmaTimeoutMs;
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : config.gemmaMaxRetries;
  }

  async generateStructured({ systemPrompt, userPrompt, schemaName }) {
    if (!this.baseUrl) {
      throw new ModelProviderError('GEMMA_BASE_URL is not configured for remote inference.');
    }

    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const endpoint = cleanBase.endsWith('/chat/completions')
      ? cleanBase
      : `${cleanBase}/chat/completions`;

    const payload = {
      model: this.modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
    };

    let attempt = 0;
    let lastError = null;

    while (attempt <= this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        if (this.apiKey) {
          const authHeader = this.apiKey.trim().startsWith('Bearer ')
            ? this.apiKey.trim()
            : `Bearer ${this.apiKey.trim()}`;
          headers['Authorization'] = authHeader;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          const errorBody = await response.text().catch(() => '');

          // Non-retryable client errors (4xx except 429)
          if (status >= 400 && status < 500 && status !== 429) {
            throw new ModelProviderError(`Gemma provider rejected request (${status}): ${errorBody}`);
          }

          // Retryable server error (5xx or 429)
          lastError = new ModelProviderError(`Gemma provider responded with ${status}: ${errorBody}`);
          if (attempt <= this.maxRetries) {
            await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, attempt - 1), 4000)));
            continue;
          }
          throw lastError;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (typeof content !== 'string') {
          throw new ModelProviderError('Gemma provider returned an unexpected response structure.');
        }

        return content;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new ModelTimeoutError(`Gemma provider request timed out after ${this.timeoutMs}ms.`);
        }

        if (error instanceof ModelProviderError) {
          if (attempt > this.maxRetries) throw error;
        }

        lastError = error;
        if (attempt <= this.maxRetries) {
          await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, attempt - 1), 4000)));
          continue;
        }
      }
    }

    throw lastError || new ModelProviderError('Failed to communicate with Gemma model provider.');
  }
}

export default GemmaProvider;
