import { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import { sendMessageStream } from './api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create new conversation
  const handleNewChat = useCallback(() => {
    const newConv = {
      id: Date.now(),
      title: 'New chat',
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMessages([]);
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback((id) => {
    setActiveConversationId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv?.messages || []);
  }, [conversations]);

  // Send message
  const handleSend = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    // Create conversation if none exists
    let currentConvId = activeConversationId;
    if (!currentConvId) {
      const newConv = {
        id: Date.now(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
      };
      setConversations(prev => [newConv, ...prev]);
      currentConvId = newConv.id;
      setActiveConversationId(currentConvId);
    }

    // Add user message
    const userMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update conversation title if first message
    if (messages.length === 0) {
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConvId
            ? { ...c, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') }
            : c
        )
      );
    }

    setIsLoading(true);
    let assistantContent = '';

    try {
      await sendMessageStream(
        content,
        messages,
        (chunk) => {
          assistantContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: assistantContent };
            } else {
              updated.push({ role: 'assistant', content: assistantContent });
            }
            return updated;
          });
        },
        () => {
          setIsLoading(false);
          setConversations(prev =>
            prev.map(c =>
              c.id === currentConvId
                ? { ...c, messages: [...newMessages, { role: 'assistant', content: assistantContent }] }
                : c
            )
          );
        },
        (error) => {
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        }
      );
    } catch (error) {
      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    }
  }, [messages, isLoading, activeConversationId]);

  return (
    <div className="flex h-screen bg-[#212121]">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">ChatGPT</h1>
        </header>

        {/* Chat Area */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input Area */}
        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}

export default App;
