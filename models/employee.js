var mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
  metadata: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }],
  infos: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' }
  }],
  isActive: {type: Boolean, default: true},
  isCheckMember: { type: Boolean, default: false },
  isApproveMember: { type: Boolean, default: false }
})

module.exports = mongoose.model('Employee', employeeSchema)