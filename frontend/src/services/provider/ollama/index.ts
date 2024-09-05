import { Ollama } from '@/services/provider/ollama/ollama.ts';
import { OLLAMA_SETTINGS } from '@/settings/ollama.ts';

const ollama = new Ollama(OLLAMA_SETTINGS);

export { ollama };
