import { useEffect } from 'react';
import { connectWS } from '../ws';

export function useSocket(socket, userName, setMessages, setTypers) {
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
      socket.current.off('messageEdited');
    };
  }, []);
}