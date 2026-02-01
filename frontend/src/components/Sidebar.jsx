import { FiPlus, FiMessageSquare, FiSettings, FiUser, FiZap } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function Sidebar({ conversations, activeId, onNewChat, onSelectChat }) {
  return (
    <div className="sidebar w-72 h-screen flex flex-col">
      {/* Logo & Brand */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <HiSparkles className="text-white text-lg" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">NeoGuide</h1>
            <p className="text-xs text-[#71717a]">AI Learning Companion</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <FiPlus size={18} className="text-white" />
          <span className="font-semibold text-white">New Conversation</span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold px-3 mb-3">
          Recent Chats
        </p>

        {conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 flex items-center justify-center border border-white/5">
              <FiZap className="text-[#8b5cf6] text-2xl" />
            </div>
            <p className="text-[#a1a1aa] text-sm mb-1">No conversations yet</p>
            <p className="text-[#71717a] text-xs">Start exploring with AI</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectChat(conv.id)}
                className={`sidebar-item w-full text-left text-sm truncate group ${activeId === conv.id ? 'active' : ''
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${activeId === conv.id
                    ? 'bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4]'
                    : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                  <FiMessageSquare size={14} className={activeId === conv.id ? 'text-white' : 'text-[#a1a1aa]'} />
                </div>
                <span className="truncate flex-1">{conv.title || 'New conversation'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pro Badge */}
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#8b5cf6]/10 to-[#06b6d4]/10 border border-[#8b5cf6]/20">
        <div className="flex items-center gap-2 mb-2">
          <FiZap className="text-[#f472b6]" />
          <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
        </div>
        <p className="text-xs text-[#a1a1aa] mb-3">Unlock unlimited conversations & advanced features</p>
        <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
          Learn More
        </button>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/5 p-3">
        <button className="sidebar-item w-full">
          <FiSettings size={16} />
          <span className="text-sm">Settings</span>
        </button>
        <button className="sidebar-item w-full">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f472b6] to-[#8b5cf6] flex items-center justify-center">
            <FiUser size={12} className="text-white" />
          </div>
          <span className="text-sm">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
