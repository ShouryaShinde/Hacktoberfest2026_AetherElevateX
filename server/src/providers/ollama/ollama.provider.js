import { BaseLlmProvider } from '../base.provider.js';
import config from '../../config/index.js';
import { ModelProviderError, ModelTimeoutError } from '../../utils/errors.js';

export class OllamaProvider extends BaseLlmProvider {
  constructor(options = {}) {
    super();
    this.baseUrl = (options.baseUrl !== undefined ? options.baseUrl : config.ollamaBaseUrl) || 'http://localhost:11434';
    this.model = options.model !== undefined ? options.model : config.ollamaModel;
    this.timeoutMs = options.timeoutMs !== undefined ? options.timeoutMs : config.ollamaTimeoutMs;
  }

  /**
   * Checks whether Ollama is reachable and whether the configured model is installed.
   * Throws ModelProviderError if Ollama is unreachable or model is missing.
   */
  async checkModelAvailability() {
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const tagsEndpoint = `${cleanBase}/api/tags`;

    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      response = await fetch(tagsEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ModelTimeoutError(`Timed out connecting to local Ollama at ${cleanBase}.`);
      }
      throw new ModelProviderError(
        `Cannot connect to local Ollama at ${cleanBase}. Please ensure Ollama is running (e.g. run 'ollama serve').`
      );
    }

    if (!response.ok) {
      throw new ModelProviderError(`Ollama server returned status ${response.status} when querying tags.`);
    }

    const data = await response.json().catch(() => ({}));
    const models = Array.isArray(data.models) ? data.models : [];
    const targetModel = (this.model || '').toLowerCase().trim();

    const isAvailable = models.some((m) => {
      const name = (m.name || m.model || '').toLowerCase().trim();
      return (
        name === targetModel ||
        name === `${targetModel}:latest` ||
        name.startsWith(`${targetModel}:`) ||
        targetModel.startsWith(name.split(':')[0])
      );
    });

    if (!isAvailable) {
      throw new ModelProviderError(
        `Model '${this.model}' is not available in local Ollama. Please run: ollama pull ${this.model}`
      );
    }
  }

  /**
   * Generates structured JSON output using Ollama's POST /api/chat endpoint
   * @param {object} input
   * @param {string} input.systemPrompt
   * @param {string} input.userPrompt
   * @param {string} [input.schemaName]
   * @returns {Promise<string>} Raw model response JSON string
   */
  async generateStructured({ systemPrompt, userPrompt, schemaName }) {
    // 1. Check local availability before attempting generation
    await this.checkModelAvailability();

    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const chatEndpoint = `${cleanBase}/api/chat`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          format: 'json',
          options: {
            temperature: 0.1,
            num_ctx: 4096,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (response.status === 404) {
          throw new ModelProviderError(
            `Model '${this.model}' not found in Ollama (404). Please run: ollama pull ${this.model}`
          );
        }
        throw new ModelProviderError(`Ollama error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.message?.content;

      if (typeof content !== 'string') {
        throw new ModelProviderError('Ollama returned an unexpected response structure (missing message.content).');
      }

      return content;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new ModelTimeoutError(`Ollama request timed out after ${this.timeoutMs}ms.`);
      }

      if (err instanceof ModelProviderError || err instanceof ModelTimeoutError) {
        throw err;
      }

      throw new ModelProviderError(`Failed to communicate with Ollama: ${err.message}`);
    }
  }
}

export default OllamaProvider;
