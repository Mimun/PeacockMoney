const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  name: {type: String},
  // jobTitles: [{type: String}],
  urls: {type: Object}
})

module.exports = mongoose.model('Role', roleSchema)