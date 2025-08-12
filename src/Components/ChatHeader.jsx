import React from 'react';
import { FaArrowLeft, FaUserPlus, FaTrash, FaTimes, FaRegCheckSquare, FaCheckSquare, FaRegSquare } from 'react-icons/fa';

const ChatHeader = ({ 
  displayName, 
  profilePic, 
  targetUserId, 
  onlineUsers, 
  someoneTyping, 
  isFriend, 
  selectedMessages, 
  selectionMode, 
  messages,
  isSelfChat = false,
  onBack, 
  onAddFriend, 
  onDeleteSelected, 
  onToggleSelectionMode,
  onSelectAll,
  onClearSelection
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <button className="back-button2" onClick={onBack} title="Go back">
          <FaArrowLeft />
        </button>
        <div className="friend-avatar-container">
          {profilePic ? (
            <img 
              src={profilePic.startsWith('/uploads/') 
                ? `https://chatapp-backend-production-abb8.up.railway.app${profilePic}` 
                : profilePic} 
              alt={displayName} 
              className="friend-avatar" 
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {!profilePic ? (
            <div className="friend-avatar-fallback">
              {displayName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="friend-avatar-fallback" style={{ display: 'none' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {onlineUsers.some(u => u.userId === targetUserId) && !isSelfChat && (
            <div className="online-status-indicator"></div>
          )}
        </div>
        <div className="user-details">
          <h1 className={`chat-title ${isFriend ? 'friend-name' : 'non-friend-name'}`}>
            <span>{displayName}</span>
          </h1>
          {someoneTyping ? (
            <div className="typing-status">{someoneTyping} is typing...</div>
          ) : (
            <div className="user-status">
              {isSelfChat ? 'Personal Notes' : (onlineUsers.some(u => u.userId === targetUserId) ? 'Online' : 'Offline')}
            </div>
          )}
        </div>
      </div>
      <div className="chat-header-actions">
        {!isFriend && !isSelfChat && (
          <button 
            className="add-friend-btn" 
            onClick={onAddFriend}
            title="Add as friend"
          >
            <FaUserPlus />
            <span className="button-text">Add Friend</span>
          </button>
        )}
        {selectionMode && messages && messages.length > 0 && (
          <>
          {selectedMessages.length > 0 && (
          <button className="delete-selected-btn" title="Delete selected messages" onClick={onDeleteSelected}>
            <FaTrash />
            <span className="button-text">{selectedMessages.length}</span>
          </button>
        )}
            <button 
              className="select-all-btn" 
              onClick={onSelectAll}
              disabled={selectedMessages.length === messages.length}
              title={selectedMessages.length === messages.length ? "All messages selected" : "Select all messages"}
            >
              <FaCheckSquare />
              <span className="button-text">Select All</span>
            </button>
            <button 
              className="clear-selection-btn" 
              onClick={onClearSelection}
              disabled={selectedMessages.length === 0}
              title={selectedMessages.length === 0 ? "No messages selected" : "Clear selection"}
            >
              <FaRegSquare />
              <span className="button-text">Clear All</span>
            </button>
          </>
        )}
        
        <button 
          className={`select-messages-btn ${selectionMode ? 'active' : ''}`} 
          onClick={onToggleSelectionMode}
          title={selectionMode ? "Cancel selection" : "Select messages"}
        >
          {selectionMode ? <><FaTimes /><span className="button-text">Cancel</span></> : <><FaRegCheckSquare /><span className="button-text">Select Messages</span></>}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
