import { useEffect } from 'react';

export function useAutoScroll(messagesEndRef, messages) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
}