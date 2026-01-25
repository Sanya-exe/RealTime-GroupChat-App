import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: Number,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
     type: String,
     enum: ["sent", "delivered", "seen"],
     default: "sent",
   },
   edited: {
    type: Boolean,
    default: false,
   },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
