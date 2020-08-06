const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  metadata: {type: Object, required: true},
  infos: [{type: Object, required: false}]
})

module.exports = mongoose.model('Item', itemSchema)