const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  infos: [{
    name: {type: String},
    value: {type: String}
  }],
  evaluationItem: {type: Object},
  status: [{type: Object}]
})

module.exports = mongoose.model('Property', propertySchema)