/**
 * API Client for Cortana Teaching Assistant
 */

const API_BASE = 'http://localhost:8000';

/**
 * Send message with streaming and level context
 */
export async function sendMessageStream(message, history = [], userLevel = null, onChunk, onComplete, onError) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
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
        stream: true,
        user_level: userLevel
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              onChunk(data.content);
            }
            if (data.done) {
              onComplete();
              return;
            }
            if (data.error) {
              onError(data.error);
              return;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error.message);
  }
}

/**
 * Submit code for review
 */
export async function reviewCode(code, context = '', userLevel = 'beginner') {
  try {
    const response = await fetch(`${API_BASE}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        context,
        user_level: userLevel
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      phase: 'CODE_REVIEW',
      feedback: [
        { type: 'error', message: `Review failed: ${error.message}` }
      ]
    };
  }
}

/**
 * Get available levels
 */
export async function getLevels() {
  try {
    const response = await fetch(`${API_BASE}/levels`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return { levels: [] };
  }
}

/**
 * Check API health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
