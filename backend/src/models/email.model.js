import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
    {
        userid:
        {
            type: String,
            required: true
        },
        email:
        {
            type: String,
            required: true,
            unique: true
        },
        server:
        {
            type: String
        }
    }
);

const Email = mongoose.model('Email', emailSchema);

export default Email;