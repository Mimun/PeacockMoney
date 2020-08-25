const mongoose =require('mongoose')

const contractTemplateSchema = new mongoose.Schema({
  templateMetadata: [{
    name: {type: String},
    value: {type: String},
    c_type: {type: String}
  }],
  contractMetadata: [{
    name: {type: String},
    value: {type: String}, 
    c_type: {type: String, default: 'default value'}
  }],
  infos: [{
    name: {type: String},
    value: {type: String}, 
    c_type: {type: String, default: 'default value'}
  }],
})

module.exports = mongoose.model('ContractTemplate', contractTemplateSchema)