const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  avatar: { type: String },
  lastName: {type: String},
  firstName: {type: String},
  userName: {type: String},
  email: {type: String},
  phone: {type: Number}, 
  role: {type: String, enum: ['admin', 'user'], default: 'user'},
  balance: {type: Number},
  userId: {type: String},
  password: {type: String}
})

module.exports = mongoose.model('User', userSchema)