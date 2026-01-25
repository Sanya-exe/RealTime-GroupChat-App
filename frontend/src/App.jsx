
import { use, useEffect, useRef, useState } from 'react';
import { connectWS } from './ws';
import { connect } from 'socket.io-client';

export default function App() {
    const timer = useRef(null);
    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const [userName, setUserName] = useState('');
    const [showNamePopup, setShowNamePopup] = useState(true);
    const [inputName, setInputName] = useState('');
    const [typers, setTypers] = useState([]);
    const [deletedForMe, setDeletedForMe] = useState(new Set());
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState("");
    const menuRef = useRef(null);




    function getUserColor(name) {
      const colors = [
        "#075E54", // green
        "#1F7AE0", // blue
        "#D81B60", // pink
        "#6A1B9A", // purple
        "#EF6C00", // orange
        "#2E7D32", // dark green
        "#C62828", // red
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

         return colors[Math.abs(hash) % colors.length];
        }

        function deleteForMe(messageId) {
        setDeletedForMe((prev) => new Set([...prev, messageId]));
         }

         function deleteForEveryone(messageId) {
         socket.current.emit("deleteMessage", messageId);
         }

         function startEdit(message) {
         setEditingMessageId(message.id);
         setEditText(message.text);
         setOpenMenuId(null);
      }

         function saveEdit(messageId) {
        setMessages(prev =>
        prev.map(m =>
        m.id === messageId
        ? { ...m, text: editText, edited: true }
        : m
    )
    );

         socket.current.emit("editMessage", {
         messageId,
        newText: editText,
     });

       setEditingMessageId(null);
       setEditText("");
      }


        useEffect(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
         }, [messages]);


    useEffect(() => {
      if (!messages.length || !userName) return;
       messages.forEach((msg) => {
    // only mark others' messages as seen
    if (
      msg.status === "delivered" &&
      msg.sender !== userName
     ) {
      socket.current.emit("messageSeen", msg.id);
       }
      });
     }, [messages, userName]);

     useEffect(() => {
     function handleClickOutside(e) {
     if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpenMenuId(null);
    }
  }

     document.addEventListener("mousedown", handleClickOutside);
     return () => {
     document.removeEventListener("mousedown", handleClickOutside);
   };
   }, []);



    useEffect(() => {
        socket.current = connectWS();

        socket.current.on('connect', () => {
            socket.current.on('roomNotice', (userName) => {
                console.log(`${userName} joined the group!`);
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
             });

        return () => {
            socket.current.off('roomNotice');
            socket.current.off('chatMessage');
            socket.current.off('typing');
            socket.current.off('stopTyping');
            socket.current.off('previousMessages');
            socket.current.off('messageDelivered');
            socket.current.off('messageSeenUpdate');
            socket.current.off('messageDeleted');
            socket.current.off('messageEdited')
        };
    }, []);

    useEffect(() => {
        if(text){
        socket.current.emit('typing', userName);
            clearTimeout(timer.current);
    }
        timer.current = setTimeout(() => {
            socket.current.emit('stopTyping', userName);
        }, 1000);
        
        return () => {
                clearTimeout(timer.current);   
        }; 
    }, [text, userName]);

    // FORMAT TIMESTAMP TO HH:MM FOR MESSAGES
    function formatTime(ts) {
        const d = new Date(ts);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }

    // SUBMIT NAME TO GET STARTED, OPEN CHAT WINDOW WITH INITIAL MESSAGE
    function handleNameSubmit(e) {
        e.preventDefault();
        const trimmed = inputName.trim();
        if (!trimmed) return;

        // join room
        socket.current.emit('joinRoom', trimmed);

        setUserName(trimmed);
        setShowNamePopup(false);
    }

    // SEND MESSAGE FUNCTION
    function sendMessage() {
        const t = text.trim();
        if (!t) return;

        // USER MESSAGE
        const msg = {
            id: Date.now(),
            sender: userName,
            text: t,
            ts: Date.now(),
        };
        setMessages((m) => [...m, msg]);

        // emit
        socket.current.emit('chatMessage', msg);

        setText('');
    }

    // HANDLE ENTER KEY TO SEND MESSAGE
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-inter">
            {/* ENTER YOUR NAME TO START CHATTING */}
            {showNamePopup && (
                <div className="fixed inset-0 flex items-center justify-center z-40">
                    <div className="bg-white rounded-xl shadow-lg max-w-md p-6">
                        <h1 className="text-xl font-semibold text-black">Enter your name</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter your name to start chatting. This will be used to identify
                        </p>
                        <form onSubmit={handleNameSubmit} className="mt-4">
                            <input
                                autoFocus
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 outline-green-500 placeholder-gray-400"
                                placeholder="Your name (e.g. John Doe)"
                            />
                            <button
                                type="submit"
                                className="block ml-auto mt-3 px-4 py-1.5 rounded-full bg-green-500 text-white font-medium cursor-pointer">
                                Continue
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CHAT WINDOW */}
            {!showNamePopup && (
                <div className="w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
                    {/* CHAT HEADER */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
                        <div className="h-10 w-10 rounded-full bg-[#075E54] flex items-center justify-center text-white font-semibold">
                            R
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-[#303030]">
                                Realtime group chat
                            </div>

                            {typers.length ? (
                                <div className="text-xs text-gray-500">
                                    {typers.join(', ')} is typing...
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            Signed in as{' '}
                            <span className="font-medium text-[#303030] capitalize">
                                {userName}
                            </span>
                        </div>
                    </div>

                    {/* CHAT MESSAGE LIST */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
                        {userName &&
                        messages.map((m) => {
                            if (deletedForMe.has(m.id) && !m.deleted) return null;
                            const mine = m.sender === userName;
                            return (
                                <div
                                    key={m.id}
                                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`relative inline-block min-w-[120px] max-w-[75%] px-3 py-2 my-2 rounded-[18px] shadow-sm ${
                                                     mine
                                                    ? "bg-[#DCF8C6] rounded-br-2xl"
                                                    : "bg-white rounded-bl-2xl"
                                                 }`}
                                                >
                                            
                                        {/* Sender name ABOVE message (only for others) */}
                                        {!mine && (
                                          <div
                                             className="text-xs font-semibold mb-1 leading-none "
                                             style={{ color: getUserColor(m.sender) }}>
                                           {m.sender}
                                             </div>
                                             )}

                                             {mine && (
                                                <div className="flex justify-end">
                                                     <button
                                                        onClick={() =>
                                                        setOpenMenuId(openMenuId === m.id ? null : m.id)
                                                         }
                                                        className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                                                            >
                                                                 ⋮
                                                            </button>
                                                            </div>
                                                            )}

                                                            {openMenuId === m.id && (
                                                                <div 
                                                                 ref={menuRef}
                                                                className="absolute z-20
                                                                 bg-white 
                                                                 border rounded-md shadow-md mt-1 text-sm">
                                                                <button
                                                                    onClick={() => {
                                                                    deleteForMe(m.id);
                                                                    setOpenMenuId(null);
                                                                    }}
                                                                 className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                Delete for me
                                                                </button>

                                                                <button
                                                                onClick={() => {
                                                                deleteForEveryone(m.id);
                                                                setOpenMenuId(null);
                                                                }}
                                                             className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
                                                                >
                                                                    Delete for everyone
                                                                        </button>
                                                                        <button
                                                                    onClick={() => startEdit(m)}
                                                                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                                                                    >
                                                                    Edit
                                                                    </button>
                                                                        </div>
                                                                            )}
                                             {/* Message text or deleted placeholder */}
                                                    {m.deleted ? (
                                                        <div className="italic text-gray-400 text-sm">
                                                                This message was deleted
                                                         </div>
                                                         ) : editingMessageId === m.id ? (
                                                            <div className="flex gap-2">
                                                           <input
                                                          value={editText}
                                                          onChange={(e) => setEditText(e.target.value)}
                                                          className="border rounded px-2 py-1 text-sm w-full"
                                                          autoFocus
                                                          />
                                                         <button
                                                         onClick={() => saveEdit(m.id)}
                                                        className="text-green-600 text-sm"
                                                                        >
                                                                 Save
                                                                 </button>
                                                                </div>
                                                                ) : (
                                                        <div className="break-words whitespace-pre-wrap">
                                                             {m.text}
                                                              {m.edited && (
                                                              <span className="ml-1 text-[11px] text-gray-400">(edited)</span>
                                                            )}
                                                         </div>
                                                            )}

                                           {/* Time + ticks */}
                                            <div className="flex justify-end items-center mt-1 gap-1">
                                            <div className="text-[11px] text-gray-500">
                                            {formatTime(m.ts)}{" "}
                                            {mine && (
                                                  <>
                                            {m.status === "sent" && "✓"}
                                            {m.status === "delivered" && "✓✓"}
                                            {m.status === "seen" && (
                                            <span className="text-blue-500">✓✓</span>
                                        )}
                                            </>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                         <div ref={messagesEndRef} >
                         </div>
                    </div>

                    {/* CHAT TEXTAREA */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-white">
                        <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-full">
                            <textarea
                                rows={1}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full resize-none px-4 py-4 text-sm outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-green-500 text-white px-4 py-2 mr-2 rounded-full text-sm font-medium cursor-pointer">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
