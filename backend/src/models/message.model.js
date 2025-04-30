import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderEmail: {
            //type: mongoose.Schema.Types.ObjectId,
            type: String,
            ref: 'User',
            required: true
        },
        receiverEmail: {
            //type: mongoose.Schema.Types.ObjectId,
            type: String,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
    },
    { timestamps: true }
)
const Message = mongoose.model('Message', messageSchema);
export default Message;