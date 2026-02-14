import { useRef, useState, useEffect} from 'react';
import RoomSelector from './components/RoomSelector';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
//import { useSocket } from './hooks/useSocket';
import { useTypingIndicator } from './hooks/useTypingIndicator';
import { useMessageSeen } from './hooks/useMessageSeen';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useClickOutside } from './hooks/useClickOutside';
import { connectWS } from './ws';

export default function App() {
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showRoomSelector, setShowRoomSelector] = useState(true);
  const [typers, setTypers] = useState([]);
  const [deletedForMe, setDeletedForMe] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Initialize socket connection
useEffect(() => {
  socket.current = connectWS();

  socket.current.on('connect', () => {
    console.log('Connected to server');
  });

  socket.current.on('roomNotice', (userName) => {
    console.log(`${userName} joined/left the group!`);
  });

  socket.current.on("chatMessage", (msg) => {
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        ts: msg.ts,
        status: "delivered",
      },
    ]);
  });

  socket.current.on("previousMessages", (msgs) => {
    setMessages(msgs.map(m => ({
      id: m.messageId,
      sender: m.sender,
      text: m.text,
      ts: new Date(m.createdAt).getTime(),
      deleted: m.deleted,
      status: m.status,
      edited: m.edited,
    })));
  });

  socket.current.on('typing', (userName) => {
    setTypers((prev) => {
      const isExist = prev.find((typer) => typer === userName);
      if (!isExist) {
        return [...prev, userName];
      }
      return prev;
    });
  });

  socket.current.on('stopTyping', (userName) => {
    setTypers((prev) => prev.filter((typer) => typer !== userName));
  });

  socket.current.on("messageDelivered", (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, status: "delivered" } : m
      )
    );
  });

  socket.current.on("messageSeenUpdate", (messageId) => {
    setMessages((prev) => prev.map((m) =>
      m.id === messageId ? { ...m, status: "seen" } : m
    )
    );
  });

  socket.current.on("messageDeleted", (messageId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, deleted: true }
          : m
      )
    );
  });

  socket.current.on("messageEdited", ({ messageId, newText, edited }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, text: newText, edited }
          : m
      )
    );
  });

  return () => {
    socket.current.off('connect');
    socket.current.off('roomNotice');
    socket.current.off('chatMessage');
    socket.current.off('typing');
    socket.current.off('stopTyping');
    socket.current.off('previousMessages');
    socket.current.off('messageDelivered');
    socket.current.off('messageSeenUpdate');
    socket.current.off('messageDeleted');
    socket.current.off('messageEdited');
  };
}, []);

  // Custom hooks
  //useSocket(socket, userName, setMessages, setTypers);
  useTypingIndicator(socket, text, userName);
  useMessageSeen(socket, messages, userName);
  useAutoScroll(messagesEndRef, messages);
  useClickOutside(menuRef, setOpenMenuId);

  // Handlers for joining room
  function handleJoinRoom(name, room) {
    socket.current.emit('joinRoom', {userName: name, roomId: room});
    setUserName(name);
    setRoomId(room);
    setShowRoomSelector(false);
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
      {showRoomSelector && <RoomSelector onJoinRoom={handleJoinRoom} />}

      {/* CHAT WINDOW */}
      {!showRoomSelector && (
        <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
          <ChatHeader userName={userName} typers={typers} roomId={roomId} />
          
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