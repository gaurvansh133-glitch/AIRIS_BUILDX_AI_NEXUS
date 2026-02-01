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
    const assistantMessage = { role: 'assistant', content: '' };

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
          const errorMessage = { role: 'assistant', content: `Error: ${error}. Make sure the backend server is running.` };
          setMessages(prev => [...prev.filter(m => m.role !== 'assistant' || m.content), errorMessage]);
        }
      );
    } catch (error) {
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}. Make sure the backend server is running.` }
      ]);
    }
  }, [messages, isLoading, activeConversationId]);

  return (
    <div className="flex h-screen bg-[#212121]">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 flex items-center justify-center border-b border-[#2f2f2f]">
          <h1 className="text-lg font-medium">🎓 Learning Guide</h1>
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
