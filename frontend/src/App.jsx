import { useRef, useState } from 'react';
import NamePopup from './components/NamePopup';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { useSocket } from './hooks/useSocket';
import { useTypingIndicator } from './hooks/useTypingIndicator';
import { useMessageSeen } from './hooks/useMessageSeen';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useClickOutside } from './hooks/useClickOutside';

export default function App() {
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [typers, setTypers] = useState([]);
  const [deletedForMe, setDeletedForMe] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Custom hooks
  useSocket(socket, userName, setMessages, setTypers);
  useTypingIndicator(socket, text, userName);
  useMessageSeen(socket, messages, userName);
  useAutoScroll(messagesEndRef, messages);
  useClickOutside(menuRef, setOpenMenuId);

  // Handlers
  function handleNameSubmit(trimmedName) {
    socket.current.emit('joinRoom', trimmedName);
    setUserName(trimmedName);
    setShowNamePopup(false);
  }

  function sendMessage() {
    const t = text.trim();
    if (!t) return;

    const msg = {
      id: Date.now(),
      sender: userName,
      text: t,
      ts: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    socket.current.emit('chatMessage', msg);
    setText('');
  }

  function deleteForMe(messageId) {
    setDeletedForMe((prev) => new Set([...prev, messageId]));
  }

  function deleteForEveryone(messageId) {
    socket.current.emit("deleteMessage", messageId);
  }

  function saveEdit(messageId, newText) {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, text: newText, edited: true }
          : m
      )
    );

    socket.current.emit("editMessage", {
      messageId,
      newText: newText,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
      {/* ENTER YOUR NAME TO START CHATTING */}
      {showNamePopup && <NamePopup onSubmit={handleNameSubmit} />}

      {/* CHAT WINDOW */}
      {!showNamePopup && (
        <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
          <ChatHeader userName={userName} typers={typers} />
          
          <MessageList
            messages={messages}
            userName={userName}
            deletedForMe={deletedForMe}
            menuRef={menuRef}
            messagesEndRef={messagesEndRef}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onDeleteForMe={deleteForMe}
            onDeleteForEveryone={deleteForEveryone}
            onSaveEdit={saveEdit}
          />
          
          <ChatInput
            text={text}
            setText={setText}
            onSend={sendMessage}
          />
        </div>
      )}
    </div>
  );
}