const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
  name: {type: String},
  // jobTitles: [{type: String}],
  abilities: {type: Object}
})

module.exports = mongoose.model('Role', roleSchema)