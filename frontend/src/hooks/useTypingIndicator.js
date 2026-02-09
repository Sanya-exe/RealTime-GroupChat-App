import { useEffect, useRef } from 'react';

export function useTypingIndicator(socket, text, userName) {
  const timer = useRef(null);

  useEffect(() => {
    if (text) {
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
}