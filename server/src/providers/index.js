import config from '../config/index.js';
import MockLlmProvider from './mock/mock.provider.js';
import GemmaProvider from './gemma/gemma.provider.js';
import OllamaProvider from './ollama/ollama.provider.js';

let activeProvider = null;

/**
 * Returns the configured LLM provider instance
 * @param {string} [providerType]
 * @returns {import('./base.provider.js').BaseLlmProvider}
 */
export const getLlmProvider = (providerType = config.gemmaProvider) => {
  if (providerType === 'ollama') {
    return new OllamaProvider();
  }

  if (providerType === 'mock') {
    return new MockLlmProvider();
  }

  if (providerType === 'hosted') {
    return new GemmaProvider();
  }

  if (providerType === 'local') {
    return new OllamaProvider();
  }

  return new OllamaProvider();
};


/**
 * For testing purposes: set an explicit provider instance
 * @param {import('./base.provider.js').BaseLlmProvider|null} provider
 */
export const setCustomProvider = (provider) => {
  activeProvider = provider;
};

export const getCurrentProvider = () => {
  return activeProvider || getLlmProvider();
};

export default {
  getLlmProvider,
  setCustomProvider,
  getCurrentProvider,
};
