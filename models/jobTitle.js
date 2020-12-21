const mongoose = require('mongoose')

const jobTitleSchema = new mongoose.Schema({
  name: {type: String},
  role: {type: mongoose.Types.ObjectId, ref: 'Role'}
})

module.exports = mongoose.model('JobTitle', jobTitleSchema)