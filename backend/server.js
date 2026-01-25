import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { createServer } from 'node:http';
import express from 'express';
import { Server } from "socket.io";
import { connectDB } from './db.js'; 
connectDB();
import Message from './models/message.js';

const onlineUsers = new Set();

const app = express();

const server = createServer(app);

const io = new Server(server,{
  cors: {
    origin:  "http://localhost:5173",
  },
});

const ROOM = "group";

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('joinRoom', async(userName) => {
    socket.userName = userName;
    onlineUsers.add(userName);

    await socket.join(ROOM);
    const messages = await Message.find({ room: ROOM }).sort({ createdAt: 1 });
    socket.emit("previousMessages", messages);

    // mark unseen messages as delivered
    await Message.updateMany(
      { room: ROOM, status: "sent", sender: { $ne: userName } },
      { status: "delivered" }
    );
       socket.emit("refreshStatuses");
        });
        
  socket.on("disconnect", () => {
    if (socket.userName) {
      onlineUsers.delete(socket.userName);
    }
    socket.to(ROOM).emit('roomNotice', socket.userName);
  });

  socket.on('chatMessage', async(msg) => {
    await Message.create({
    messageId: msg.id,
    sender: msg.sender,
    text: msg.text,
    room: ROOM,
    deleted: false,
    status: "sent",
    });
      socket.to(ROOM).emit('chatMessage', msg);
      // if at least one other user is online, mark delivered
      if (onlineUsers.size > 1) {
      await Message.findOneAndUpdate(
      { messageId: msg.id },
      { status: "delivered" }
    );
    socket.emit("messageDelivered", msg.id);
  }
});
  
  socket.on("messageSeen", async (messageId) => {
  await Message.findOneAndUpdate(
    { messageId },
    { status: "seen" }
    );
        io.to(ROOM).emit("messageSeenUpdate", messageId);
      });
        socket.on('typing', (userName) => {
        socket.to(ROOM).emit('typing', userName);
     });
        socket.on('stopTyping', (userName) => {
        socket.to(ROOM).emit('stopTyping', userName);
     });
        socket.on("deleteMessage", async (messageId) => {
        await Message.findOneAndUpdate(
         { messageId },
         { deleted: true }
      );
        io.to(ROOM).emit("messageDeleted", messageId);
        });
        socket.on("editMessage", async ({ messageId, newText }) => {
        const updated = await Message.findOneAndUpdate(
        { messageId },
        { text: newText, edited: true },
        { new: true }
      );
        io.to(ROOM).emit("messageEdited", {
        messageId,
        newText: updated.text,
        edited: true,
    });
      });
         });

server.listen(4600, () => {
  console.log('server running at http://localhost:4600');
});