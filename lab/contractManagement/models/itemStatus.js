const mongoose = require('mongoose')

const itemStatusSchema = new mongoose.Schema({
  metadata: {type: Object, required: true},
  infos: [{type: Object, required: false}]
})

module.exports = mongoose.model('ItemStatus', itemStatusSchema)