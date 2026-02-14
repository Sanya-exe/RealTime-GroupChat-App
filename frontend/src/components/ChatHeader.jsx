import { useState } from "react";

export default function ChatHeader({ userName, typers, roomId }) {
  const [copied, setCopied] = useState(false);

  function copyRoomCode() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
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
         <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Room:</span>
            <button
              onClick={copyRoomCode}
              className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
              title="Click to copy room code">
              <span className="font-semibold text-green-600">{roomId}</span>
              {copied ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-gray-400">📋</span>
              )}
            </button>
            {copied && (
              <span className="text-xs text-green-600 animate-fade">Copied!</span>
            )}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-500">
        Signed in as{' '}
        <span className="font-medium text-[#303030] capitalize">
          {userName}
        </span>
      </div>
    </div>
  );
}