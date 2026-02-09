import { useState } from 'react';
import { getUserColor, formatTime } from '../utils';

export default function MessageItem({ 
  message, 
  userName, 
  menuRef,
  openMenuId,
  setOpenMenuId,
  onDeleteForMe,
  onDeleteForEveryone,
  onEdit,
  onSaveEdit
}) {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const mine = message.sender === userName;

  function startEdit(msg) {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
    setOpenMenuId(null);
  }

  function saveEdit(messageId) {
    onSaveEdit(messageId, editText);
    setEditingMessageId(null);
    setEditText("");
  }

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
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
            style={{ color: getUserColor(message.sender) }}>
            {message.sender}
          </div>
        )}

        {mine && (
          <div className="flex justify-end">
            <button
              onClick={() =>
                setOpenMenuId(openMenuId === message.id ? null : message.id)
              }
              className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
            >
              ⋮
            </button>
          </div>
        )}

        {openMenuId === message.id && (
          <div
            ref={menuRef}
            className="absolute z-20 bg-white border rounded-md shadow-md mt-1 text-sm">
            <button
              onClick={() => {
                onDeleteForMe(message.id);
                setOpenMenuId(null);
              }}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Delete for me
            </button>

            <button
              onClick={() => {
                onDeleteForEveryone(message.id);
                setOpenMenuId(null);
              }}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
            >
              Delete for everyone
            </button>
            <button
              onClick={() => startEdit(message)}
              className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              Edit
            </button>
          </div>
        )}

        {/* Message text or deleted placeholder */}
        {message.deleted ? (
          <div className="italic text-gray-400 text-sm">
            This message was deleted
          </div>
        ) : editingMessageId === message.id ? (
          <div className="flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
              autoFocus
            />
            <button
              onClick={() => saveEdit(message.id)}
              className="text-green-600 text-sm"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="break-words whitespace-pre-wrap">
            {message.text}
            {message.edited && (
              <span className="ml-1 text-[11px] text-gray-400">(edited)</span>
            )}
          </div>
        )}

        {/* Time + ticks */}
        <div className="flex justify-end items-center mt-1 gap-1">
          <div className="text-[11px] text-gray-500">
            {formatTime(message.ts)}{" "}
            {mine && (
              <>
                {message.status === "sent" && "✓"}
                {message.status === "delivered" && "✓✓"}
                {message.status === "seen" && (
                  <span className="text-blue-500">✓✓</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}