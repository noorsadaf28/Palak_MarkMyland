const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const dataSchema = new mongoose.Schema({

    name: {
        required: true,
        type: String
    },
    lat: {
        required: true,
        type: Number
    },
    long: {
        required: true,
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
})


const Data = mongoose.model('Data', dataSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Data, User };
