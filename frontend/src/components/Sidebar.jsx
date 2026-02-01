import { FiPlus, FiMessageSquare, FiSettings, FiUser } from 'react-icons/fi';

function Sidebar({ conversations, activeId, onNewChat, onSelectChat }) {
  return (
    <div className="w-64 bg-[#171717] h-screen flex flex-col border-r border-[#2f2f2f]">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-[#424242] hover:bg-[#2f2f2f] transition-colors text-sm"
        >
          <FiPlus size={16} />
          <span>New chat</span>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <div className="text-center text-[#8e8e8e] text-sm py-8 px-4">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectChat(conv.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-colors truncate ${activeId === conv.id
                    ? 'bg-[#2f2f2f]'
                    : 'hover:bg-[#212121]'
                  }`}
              >
                <FiMessageSquare size={16} className="flex-shrink-0" />
                <span className="truncate">{conv.title || 'New conversation'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#2f2f2f] p-2">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm">
          <FiSettings size={16} />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#2f2f2f] transition-colors text-sm">
          <FiUser size={16} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
