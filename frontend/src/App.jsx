import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import { sendMessageStream } from './api';
import './index.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create a new conversation
  const handleNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newConversation = {
      id: newId,
      title: 'New conversation',
      messages: []
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    setMessages([]);
  }, []);

  // Select a conversation
  const handleSelectChat = useCallback((id) => {
    setActiveConversationId(id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversations]);

  // Send a message
  const handleSend = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    // Create new conversation if none active
    let currentConvId = activeConversationId;
    if (!currentConvId) {
      const newId = Date.now().toString();
      const newConversation = {
        id: newId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: []
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newId);
      currentConvId = newId;
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

    // Start loading
    setIsLoading(true);

    // Prepare for assistant response
    let assistantContent = '';

    try {
      await sendMessageStream(
        content,
        messages,
        // onChunk
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
        // onComplete
        () => {
          setIsLoading(false);
          // Save to conversation
          setConversations(prev =>
            prev.map(c =>
              c.id === currentConvId
                ? { ...c, messages: [...newMessages, { role: 'assistant', content: assistantContent }] }
                : c
            )
          );
        },
        // onError
        (error) => {
          setIsLoading(false);
          const errorMessage = { role: 'assistant', content: `⚠️ Connection error: ${error}. Please ensure the backend is running.` };
          setMessages(prev => [...prev.filter(m => m.role !== 'assistant' || m.content), errorMessage]);
        }
      );
    } catch (error) {
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${error.message}. Please check your connection.` }
      ]);
    }
  }, [messages, isLoading, activeConversationId]);

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Animated Background Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="relative h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-xl bg-[#030014]/50 z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-sm text-[#a1a1aa]">AI Ready</span>
          </div>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-gradient">
            NeoGuide
          </h1>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 rounded-lg text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all">
              History
            </button>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              Upgrade
            </button>
          </div>
        </header>

        {/* Chat Window */}
        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* Input */}
        <MessageInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}

export default App;
