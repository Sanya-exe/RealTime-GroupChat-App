import { useState } from 'react';

export default function RoomSelector({ onJoinRoom }) {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [mode, setMode] = useState('join'); // 'join' or 'create'

  // Generate random room code
  function createRoomCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    let finalRoomId;
    
    if (mode === 'create') {
      // Create new room with random code
      finalRoomId = createRoomCode();
    } else {
      // Join existing room
      if (!roomId.trim()) {
        alert('Please enter a room code');
        return;
      }
      finalRoomId = roomId.trim().toUpperCase();
    }
    
    onJoinRoom(userName.trim(), finalRoomId);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to ChatHub</h1>
          <p className="text-gray-500 mt-2">Create or join a room to start chatting</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
              mode === 'create'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}>
            ➕ Create Room
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
              mode === 'join'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}>
            🚪 Join Room
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              autoFocus
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-green-500 transition-colors"
              placeholder="Enter your name"
            />
          </div>

          {/* Room Code Input (only for join mode) */}
          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-green-500 transition-colors font-mono text-lg tracking-wider"
                placeholder="e.g., ABC123XY"
                maxLength={8}
              />
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              {mode === 'create' ? (
                <>
                  🎉 <strong>Create a new room</strong> and share the code with your friends to chat together!
                </>
              ) : (
                <>
                  🔑 <strong>Enter the room code</strong> shared by your friend to join their chat room.
                </>
              )}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
            {mode === 'create' ? '🚀 Create & Join Room' : '👋 Join Room'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Secure • Private • Real-time</p>
        </div>
      </div>
    </div>
  );
}