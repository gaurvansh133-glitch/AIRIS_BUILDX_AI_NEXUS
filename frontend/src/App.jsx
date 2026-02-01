import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import CodePlayground from './components/CodePlayground';
import { sendMessageStream, reviewCode } from './api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Session state for Socratic teaching
  const [userLevel, setUserLevel] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPlayground, setShowPlayground] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState([]);

  const handleNewChat = useCallback(() => {
    const newConv = {
      id: Date.now(),
      title: 'New chat',
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setMessages([]);
    setUserLevel(null);
    setCurrentStep(0);
    setShowPlayground(false);
    setCodeFeedback([]);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setActiveConversationId(id);
    const conv = conversations.find(c => c.id === id);
    setMessages(conv?.messages || []);
  }, [conversations]);

  const handleLevelSelect = useCallback((level) => {
    setUserLevel(level);
    // Send level selection as a message
    handleSend(`I'm at the ${level} level.`);
  }, []);

  const handleCodeSubmit = useCallback(async (code) => {
    setIsLoading(true);
    try {
      const result = await reviewCode(code, 'User code submission', userLevel || 'beginner');
      setCodeFeedback(result.feedback || []);

      // Add code review to chat
      const codeMessage = { role: 'user', content: `\`\`\`\n${code}\n\`\`\`` };
      const feedbackText = result.feedback?.map(f => `**${f.type?.toUpperCase()}:** ${f.message}`).join('\n\n') || 'Great job!';
      const reviewMessage = { role: 'assistant', content: `**[CODE REVIEW]**\n\n${feedbackText}` };

      setMessages(prev => [...prev, codeMessage, reviewMessage]);
    } catch (error) {
      setCodeFeedback([{ type: 'error', message: error.message }]);
    }
    setIsLoading(false);
  }, [userLevel]);

  const handleSend = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

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

    const userMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

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
        userLevel,
        (chunk) => {
          assistantContent += chunk;

          // Check for playground trigger
          if (assistantContent.includes('show_playground": true') ||
            assistantContent.includes('[NEAR-SOLUTION]') ||
            assistantContent.includes('[NEAR_SOLUTION]')) {
            setShowPlayground(true);
          }

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
          setCurrentStep(prev => prev + 1);
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
  }, [messages, isLoading, activeConversationId, userLevel]);

  return (
    <div className="flex h-screen bg-[#212121]">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
        userLevel={userLevel}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="flex items-center gap-2">
            <h1 className="header-title">Cortana</h1>
            <span className="text-xs text-[#8e8e8e]">Socratic Teaching Assistant</span>
          </div>
          {userLevel && (
            <div className={`level-indicator level-${userLevel}`}>
              {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} • Step {currentStep}
            </div>
          )}
        </header>

        {/* Main Area with Chat and Playground */}
        <div className="content-area">
          {/* Chat Area */}
          <div className={`chat-section ${showPlayground ? 'with-playground' : ''}`}>
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              onLevelSelect={handleLevelSelect}
              userLevel={userLevel}
            />
            <MessageInput onSend={handleSend} disabled={isLoading} />
          </div>

          {/* Coding Playground */}
          {showPlayground && (
            <div className="playground-section">
              <CodePlayground
                onSubmit={handleCodeSubmit}
                feedback={codeFeedback}
                disabled={isLoading}
                level={userLevel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
