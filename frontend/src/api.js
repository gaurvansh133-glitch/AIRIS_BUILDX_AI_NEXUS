/**
 * API client for chat functionality
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Send a chat message and stream the response
 * @param {string} message - The user's message
 * @param {Array} history - Previous conversation messages
 * @param {function} onChunk - Callback for each streamed chunk
 * @param {function} onComplete - Callback when streaming is complete
 * @param {function} onError - Callback for errors
 */
export async function sendMessageStream(message, history, onChunk, onComplete, onError) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              onChunk(data.content);
            }
            if (data.done) {
              onComplete();
            }
            if (data.error) {
              onError(data.error);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
}

/**
 * Send a chat message and get a complete response (non-streaming)
 * @param {string} message - The user's message
 * @param {Array} history - Previous conversation messages
 * @returns {Promise<string>} The assistant's response
 */
export async function sendMessage(message, history) {
  const response = await fetch(`${API_BASE_URL}/chat/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Check API health
 * @returns {Promise<object>} Health status
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('API is not healthy');
  }
  return response.json();
}
