/**
 * AI Service
 * Integrates with the MemoraOS ReflectAgent backend via Flask API.
 */

import { sendChatMessage } from './apiService';
import type { Message } from './chatMemory';

/**
 * Send a message to the AI and get a response.
 * Now connected to the real ReflectAgent backend!
 */
async function sendMessage(history: Message[], userMessage: string): Promise<Message> {
  try {
    const response = await sendChatMessage(userMessage);

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
      metadata: {
        model: 'ReflectAgent (Ollama phi3:mini)',
      },
    };
  } catch (error) {
    console.error('[AIService] Error:', error);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Sorry, I encountered an error connecting to the backend. Please make sure the MemoraOS server is running on port 5000.',
      timestamp: Date.now(),
      metadata: {
        error: true,
      },
    };
  }
}

export default {
  sendMessage,
};
