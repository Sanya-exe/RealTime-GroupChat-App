import { useState } from 'react';

export default function NamePopup({ onSubmit }) {
  const [inputName, setInputName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="bg-white rounded-xl shadow-lg max-w-md p-6">
        <h1 className="text-xl font-semibold text-black">Enter your name</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your name to start chatting. This will be used to identify
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
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
  );
}
