const mongoose =require('mongoose')

const contractTemplateSchema = new mongoose.Schema({
  metadata: {type: Object, required: true},
  infos: [{type: Object, required: false}]
})

module.exports = mongoose.model('ContractTemplate', contractTemplateSchema)