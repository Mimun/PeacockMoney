const mongoose = require('mongoose')

const warehouseItem = new mongoose.Schema({
  infos: [{
    name: {type: String},
    value: {type: String}
  }],
  evaluationItem: {type: Object},
  status: [{type: Object}]
})

module.exports = mongoose.model('WarehouseItem', warehouseItem)