import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { createServer } from 'node:http';
import express from 'express';
import { Server } from "socket.io";
import { connectDB } from './db.js'; 
connectDB();
import Message from './models/message.js';

// track online users per room
const roomUsers = new Map(); // {roomId: Set(userNames)}

const app = express();

const server = createServer(app);

const io = new Server(server,{
  cors: {
    origin:  "http://localhost:5173",
  },
});

// const ROOM = "group";

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // Modified : now accepts both userName and roomId
  socket.on('joinRoom', async( {userName, roomId} ) => {
     console.log('joinRoom received:', { userName, roomId });

    socket.userName = userName;
    socket.roomId = roomId; // Store room ID in socket
    // onlineUsers.add(userName);

    if(!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set()); 
    }

    // add user to this room's user set
    roomUsers.get(roomId).add(userName);

    
   // join the specific room
    await socket.join(roomId);

    //get the previous message for this room only
    const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 });
    socket.emit("previousMessages", messages);

    // mark unseen messages as delivered
    await Message.updateMany(
      { room: roomId, status: "sent", sender: { $ne: userName } },
      { status: "delivered" }
    );
       socket.emit("refreshStatuses");

       // notify others in this room
        socket.to(roomId).emit('roomNotice', userName);

        console.log(`${userName} joined room:  ${roomId}`);
        console.log(`Room ${roomId} now has ${roomUsers.get(roomId).size} users`);
        });
        
  socket.on("disconnect", () => {
    if (socket.userName && socket.roomId) {
      const users = roomUsers.get(socket.roomId);
      if(users){
        users.delete(socket.userName);

        if(users.size === 0){
          roomUsers.delete(socket.roomId);
          console.log(`Room ${socket.roomId} is now empty and removed.`);
        } else{
          console.log(`Room ${socket.roomId} now has ${users.size} users`);
        }
      }
    
      socket.to(socket.roomId).emit('roomNotice', socket.userName);
      console.log(`${socket.userName} left room: ${socket.roomId}`);
    }
  });

  socket.on('chatMessage', async(msg) => {
    const roomId = socket.roomId;

      console.log('Message received:', msg);
      console.log('Saving to room:', roomId);

    await Message.create({
    messageId: msg.id,
    sender: msg.sender,
    text: msg.text,
    room: roomId,
    deleted: false,
    status: "sent",
    });
      socket.to(roomId).emit('chatMessage', msg);
      // if at least one other user is online, mark delivered
      const roomUserCount = roomUsers.get(roomId)?.size || 0;
      console.log(`Room ${roomId} has ${roomUserCount} users online`);

      if (roomUserCount > 1) {
      await Message.findOneAndUpdate(
      { messageId: msg.id },
      { status: "delivered" }
    );
    socket.emit("messageDelivered", msg.id);
    console.log(`Message ${msg.id} marked as delivered`);
  }
});
  
  socket.on("messageSeen", async (messageId) => {
  await Message.findOneAndUpdate(
    { messageId },
    { status: "seen" }
    );
        io.to(socket.roomId).emit("messageSeenUpdate", messageId);
      });
        socket.on('typing', (userName) => {
        socket.to(socket.roomId).emit('typing', userName);
     });
        socket.on('stopTyping', (userName) => {
        socket.to(socket.roomId).emit('stopTyping', userName);
     });
        socket.on("deleteMessage", async (messageId) => {
        const updated = await Message.findOneAndUpdate(
         { messageId },
         { deleted: true },
         { new: true }
      );
        io.to(socket.roomId).emit("messageDeleted", messageId);
        });
        socket.on("editMessage", async ({ messageId, newText }) => {
        const updated = await Message.findOneAndUpdate(
        { messageId },
        { text: newText, edited: true },
        { new: true }
      );
        io.to(socket.roomId).emit("messageEdited", {
        messageId,
        newText: updated.text,
        edited: true,
    });
      });
         });

 server.listen(4600, () => {
  console.log('server running at http://localhost:4600');
});