const mongoose = require('mongoose')

const itemTypeSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  id: { type: String, default: '' },

})

module.exports = mongoose.model('ItemType', itemTypeSchema)