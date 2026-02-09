import { useEffect } from 'react';

export function useMessageSeen(socket, messages, userName) {
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
}