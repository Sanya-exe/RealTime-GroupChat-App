import MessageItem from './MessageItem';

export default function MessageList({ 
  messages, 
  userName, 
  deletedForMe,
  menuRef,
  messagesEndRef,
  openMenuId,
  setOpenMenuId,
  onDeleteForMe,
  onDeleteForEveryone,
  onSaveEdit
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-100 flex flex-col">
      {userName &&
        messages.map((m) => {
          if (deletedForMe.has(m.id) && !m.deleted) return null;
          return (
            <MessageItem
              key={m.id}
              message={m}
              userName={userName}
              menuRef={menuRef}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onDeleteForMe={onDeleteForMe}
              onDeleteForEveryone={onDeleteForEveryone}
              onSaveEdit={onSaveEdit}
            />
          );
        })}
      <div ref={messagesEndRef}></div>
    </div>
  );
}