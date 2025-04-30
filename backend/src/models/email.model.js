import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
    {
        userid:
        {
            type: String,
            require: true
        },
        email:
        {
            type: String,
            require: true,
            unique: true
        },
        server:
        {
            type: Number
        }
    }
);

const Email = mongoose.model('Email', emailSchema);

export default Email;