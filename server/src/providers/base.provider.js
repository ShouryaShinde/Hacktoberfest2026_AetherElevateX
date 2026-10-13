/**
 * Base abstract class for LLM providers
 */
export class BaseLlmProvider {
  /**
   * Generates a structured response from the model
   * @param {object} input
   * @param {string} input.systemPrompt
   * @param {string} input.userPrompt
   * @param {string} input.schemaName
   * @returns {Promise<string>} Raw model response string (expected to be JSON)
   */
  async generateStructured({ systemPrompt, userPrompt, schemaName }) {
    throw new Error('generateStructured() must be implemented by subclass');
  }
}

export default BaseLlmProvider;
