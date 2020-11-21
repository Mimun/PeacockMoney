var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const _ = require('lodash')
const Item = require('../../../models/item');
const ItemStatus = require('../../../models/itemStatus');
const ContractTemplate = require('../../../models/contractTemplate')
const Contract = require('../../../models/contract');
const Property = require('../../../models/property')
const Store = require('../../../models/store')
const Employee = require('../../../models/employee')
const Warehouse = require('../../../models/warehouse')
const ItemType = require('../../../models/itemType')
const CronJob = require('cron').CronJob

var Record = require('../../../js/record3')
var PeriodRecord = require('../../../js/periodRecord3')
// import Record from '../../../js/record2.js'

var fs = require('fs');
var async = require('async');
const auth = require('../../authentication/routes/checkAuthentication');

function findNestedObj(entireObj, keyToFind, valToFind) {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// function to format date as YYYY-MM-DD
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

// CONTRACT TEMPLATE
// contract template list for admin
router.get('/', function (req, res, next) {
  async.parallel({
    contractTemplateList: callback => {
      ContractTemplate.find({}).exec(callback)
    },
    itemTypeList: callback => {
      ItemType.find().exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    res.render('index', { contractTemplateList: results.contractTemplateList, itemTypeList: results.itemTypeList })

  })
})

// contract template list for user
router.get('/contractTemplates', (req, res, next) => {
  ContractTemplate.find({}, (err, results) => {
    if (err) throw err

    var typeArray = [], payOptionArray = []

    results.forEach(result => {
      typeArray.push(findNestedObj(result, 'name', 'itemType').value)
      payOptionArray.push(findNestedObj(result, 'name', 'paymentMethod').value)

    })
    typeArray = typeArray.filter((item, pos) => {
      return typeArray.indexOf(item) == pos
    })
    payOptionArray = payOptionArray.filter((item, pos) => {
      return payOptionArray.indexOf(item) == pos
    })
    res.render('indexCopy', { types: typeArray, payOptions: payOptionArray })
  })

})

// function to filter contract template
const filterContract = (value1, value2, value3, req, res, next) => {
  async.parallel({
    result1: (callback) => {
      try {
        if (value1 !== '') {
          ContractTemplate.find({}).elemMatch('templateMetadata', { 'value': value1 }).exec(callback)

        } else {
          ContractTemplate.find({}).exec(callback)
        }

      } catch (err) {
        next(err)
      }
    },
    result2: (callback) => {
      try {
        if (value2 !== '') {
          ContractTemplate.find({}).elemMatch('templateMetadata', { 'value': value2 }).exec(callback)

        } else {
          ContractTemplate.find({}).exec(callback)
        }

      } catch (err) {
        next(err)
      }
    },
    result3: callback => {
      try {
        ContractTemplate.find({}).exec(callback)

      } catch (err) {
        next(err)
      }

    }
  }, (err, result) => {
    if (err) throw err
    var array1 = result.result1, array2 = result.result2, array3 = result.result3, array4 = []
    var array12 = []
    array1.map(item1 => {
      array2.map(item2 => {
        if (JSON.stringify(item1) === JSON.stringify(item2)) {
          array12.push(item2)
        }
      })
    })
    array3 = array3.filter(item => {
      var min = parseInt(findNestedObj(item, 'name', 'min').value)
      var max = parseInt(findNestedObj(item, 'name', 'max').value)
      console.log('min', min)
      console.log('max', max)
      if (value3) {
        if (min <= value3 && value3 <= max) {
          return item
        }
      } else {
        return item
      }

    })


    array12.map(item12 => {
      array3.map(item3 => {
        if (JSON.stringify(item12) === JSON.stringify(item3)) {
          array4.push(item3)
        }
      })
    })

    res.send(array4)

  })

}

// route for query desired template
router.post('/findContractTemplates', (req, res, next) => {
  const chosenType = req.body.chosenType
  const chosenPayOption = req.body.chosenPayOption
  const amountOfMoney = req.body.amountOfMoney
  console.log('data received: ', req.body)
  filterContract(chosenType, chosenPayOption, amountOfMoney, req, res)
})

// create new contract template route
router.post('/createNewContractTemplate', (req, res, next) => {
  // console.log('body: ', req.body)

  const itemObject = req.body
  const imageObj = findNestedObj(itemObject, 'name', 'image')

  const imageExt = imageObj.value.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/')[1]
  console.log('image extension: ', imageExt)

  const base64image = imageObj.value.replace(/^data:image\/[a-z]+;base64,/, "")
  fs.writeFile(`public/images/${itemObject._id}.${imageExt}`, base64image, 'base64', (err) => {
    if (err) console.error(err)
    findNestedObj(itemObject, 'name', 'image').value = `/images/${itemObject._id}.${imageExt}`
    const contractTemplate = new ContractTemplate(itemObject)
    contractTemplate.save((err, result) => {
      if (err) throw err
      res.send('Saved new contract template successfully!')
      // res.send({ contractTemplateList: result })


    })
    console.log('data: ', itemObject)
  })
})

// get a contract template to create new contract
router.get('/contractTemplates/:id', (req, res) => {

  console.log('req: ', req.params.id)
  async.parallel({
    contractTemplate: callback => {
      ContractTemplate.findOne({ _id: req.params.id }).exec(callback)
    },
    item: callback => {
      Item.find({}).limit(20).exec(callback)
    },
    itemStatus: callback => {
      ItemStatus.find({}).limit(20).exec(callback)
    },
    store: callback => {
      Store.find({}).exec(callback)
    },
    contractNow: callback => {
      Contract.find({}).elemMatch('contractMetadata', { 'value': formatDate(new Date(Date.now())) }).exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    res.render('createNewContract', {
      itemResults: results.item, statusResults: results.itemStatus,
      contractInfo: results.contractTemplate, stores: results.store,
      contractNow: results.contractNow
    });
  })
})

router.post('/getStores', (req, res, next) => {
  console.log('req.body: ', req.body)
  Store.findOne({ _id: req.body.data }).exec((err, result) => {
    if (err) throw err
    console.log('results: ', result)
    // find representative
    if (result) {
      async.parallel({
        representatives: callback => {
          Employee.find({ _id: { $in: result.representatives } }).exec(callback)
        },
        employees: callback => {
          Employee.find({ "metadata.value": findNestedObj(result, 'name', 'id').value }).exec(callback)
        }
      }, async (err, results) => {
        if (err) throw err
        console.log('representatives: ', results.representatives.length)
        console.log('employees: ', results.employees.length)
        var employeeList = results.representatives.concat(results.employees)
        employeeList = employeeList.map(employee => {
          return {
            _id: employee._id,
            name: findNestedObj(employee, 'name', 'name').value,
            role: findNestedObj(employee, 'name', 'role').value
          }
        })

        res.send({
          employeeList: _.uniqBy(employeeList, e => {
            return JSON.stringify(e._id)
          })
        })
      })
    }
  })
})

// search item || itemstatus
router.post('/search', (req, res, next) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')

    arrayMetadataConditions.push({ 'metadata.value': regex })
    arrayInfosConditions.push({ 'infos.value': regex })
  })
  async.parallel({
    itemResults: (callback) => {
      try {
        Item.find({ $or: [{ $and: arrayMetadataConditions }, { $and: arrayInfosConditions }] }).exec(callback)
      } catch (err) {
        next(err)
      }
    },
    itemStatusResults: (callback) => {
      try {
        ItemStatus.find({ $or: [{ $and: arrayMetadataConditions }, { $and: arrayInfosConditions }] }).exec(callback)

      } catch (err) {
        next(err)
      }
    }
  }, (err, result) => {
    if (err) throw (err)
    res.send({ itemResults: result.itemResults, itemStatusResults: result.itemStatusResults })
  })

})

// delete contract template route
router.delete('/deleteContractTemplate/:id', (req, res) => {
  console.log('ID received: ', JSON.stringify('public' + req.body.value))
  // fs.stat(JSON.stringify('public' + req.body.value), (err, stats) => {
  //   console.log('stats: ', stats)
  //   if (err) {
  //     return console.error(err);
  //   }
  //   fs.unlink(JSON.stringify('public' + req.body.value), (err)=>{
  //     if(err) return console.error(err)
  //     console.log('File deleted successfully!')
  //   })

  // })
  ContractTemplate.findOneAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) throw err
    res.send('Delete contract: ', result, ' successfully!')
  })
})

// CONTRACT
// contract list
router.get('/contracts', (req, res) => {
  const checkDate = formatDate(new Date())
  console.log('date now: ', checkDate)
  async.parallel({
    contract: callback => {
      Contract.find({}, {}, { sort: { '_id': -1 } }).populate([
        {
          path: 'store.value',
          model: 'Store'
        },
        {
          path: 'employee.value',
          model: 'Employee'
        }
      ]).exec(callback)
    },
    contractNow: callback => {
      Contract.find({}).elemMatch('contractMetadata', { 'value': formatDate(new Date(Date.now())) }).exec(callback)
    }
  }, (err, result2) => {
    if (err) throw err
    res.render('contractList', { contractList: result2.contract, roleAbility: req.roleAbility, payload: req.payload, contractNow: result2.contractNow })

  })

})

// create new contract
router.post('/contracts', (req, res) => {
  var data = req.body
  const contract = new Contract(data)
  console.log('contract items; ', contract)
  try {
    contract.save((err, result) => {
      if (err) throw err
      res.send('Saved contract successfully!')
    })
  } catch (error) {
    console.error(error)
  }

})

// delete contract
router.delete('/contracts/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  Contract.findByIdAndDelete({ _id: req.params.id }).exec((err, result) => {
    if (err) throw err
    res.send('Delete contract successfully!')
  })
})

// function to create property
const createProperty = (metadata, infos, evaluationItem, status, contract, originWarehouse,
  currentWarehouse, lastWarehouse, movement, isIn, id) => {
  return {
    metadata,
    infos,
    evaluationItem,
    status,
    contract,
    originWarehouse,
    currentWarehouse,
    lastWarehouse,
    movement,
    isIn,
    id

  }
}

// function to generate property id
const createPropertyId = (contractId, itemTypeId, index = 0) => {
  return `${itemTypeId !== '' ? itemTypeId : 'None'}.${contractId !== '' ? contractId : 'None'}.${index}`
}

// update status of a contract
router.put('/contracts/:id', async (req, res) => {
  console.log('id received: ', req.params.id)
  console.log('body: ', req.body)
  var contract = req.body.contract
  var contractId = contract.id
  var interestRate = parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'interestRate')))
  var presentValue = parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan')))
  var agreementDate = new Date(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractCreatedDate')))
  var numberOfPeriods = parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'numberOfAcceptanceTerms')))
  var ruleArray = contract.penaltyRules
  var blockArray = contract.blockRules
  var realLifeDate = new Date(agreementDate)
  var simulation = parseInt(getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'paymentMethod')))
  var loanPackage = new Record({
    interestRate, presentValue, agreementDate,
    numberOfPeriods, ruleArray, blockArray, realLifeDate, simulation, contractId
  })
  await loanPackage.createPeriodRecords()
  await loanPackage.pushLoanMorePayDownHistory({
    id: `${loanPackage.contractId}.${formatDate(loanPackage.agreementDate, 1)}`,
    date: loanPackage.agreementDate,
    value: -loanPackage.presentValue,

  })
  var object = {
    id: `${loanPackage.contractId}.${formatDate(loanPackage.realLifeDate, 1)}`,
    date: loanPackage.realLifeDate,
    array: []
  }
  object.array.push({
    root: 0,
    paid: loanPackage.presentValue,
    remain: 0,
    receiptId: 'C-Giải ngân mới',
    receiptReason: `Giải ngân`,
    date: formatDate(loanPackage.realLifeDate),
    type: 'cash',
    receiptType: 2,
  })
  loanPackage.receiptRecords.push(object)
  try {
    Contract.findOneAndUpdate({ _id: req.params.id },
      { $set: { "contractStatus": req.body.contractStatus, 'loanPackage': loanPackage } }, { new: true })
      .populate([
        {
          path: 'store.value',
          model: 'Store'
        },
        {
          path: 'employee.value',
          model: 'Employee'
        }
      ])
      .exec(async (err, contractResult) => {
        if (err) throw err
        var contractId = contractResult.id
        var itemTypeId = findNestedObj(contractResult.templateMetadata, 'name', 'itemTypeId') ?
          findNestedObj(contractResult.templateMetadata, 'name', 'itemTypeId').value : "None"
        console.log('contarct id: ', contractId)
        console.log('itemtype id: ', itemTypeId)

        // add property only when the contract is approved
        if (contractResult.contractStatus === 'approved') {
          try {
            async.parallel({
              warehouseResult: callback => {
                Warehouse.findOne({ store: contractResult.store.value }).exec(callback)
              },
              storeResult: callback => {
                Store.findOne({ _id: contractResult.store.value }).exec(callback)
              }
            }, async (err, results) => {
              if (err) throw err
              if (contractResult.items.length !== 0) {
                await contractResult.items.forEach(async (item, index) => {
                  var warehouseResult = results.warehouseResult
                  var storeResult = results.storeResult
                  if (warehouseResult) {
                    // property metadata
                    var propertyMetadata = item.evaluationItem ? item.evaluationItem.metadata : [null]

                    // property infos
                    var propertyInfos = item.infos

                    // property evaluation
                    var propertyEvaluation = item.evaluationItem ? item.evaluationItem : null

                    // property status
                    var propertyStatus = item.status

                    // property contract
                    var propertyContract = contractResult

                    // property origin warehouse
                    var propertyOriginWarehouse = results.warehouseResult

                    // property current warehouse
                    var propertyCurrentWarehouse = results.warehouseResult

                    // property last warehouse
                    var propertyLastWarehouse = null

                    // property movement
                    var propertyMovement = [{
                      storeId: findNestedObj(storeResult.metadata, 'name', 'id') ? findNestedObj(storeResult.metadata, 'name', 'id').value : '',
                      warehouseFrom: 'Hop dong',
                      warehouseTo: findNestedObj(results.warehouseResult, 'name', 'name') ? findNestedObj(results.warehouseResult, 'name', 'name').value : 'None',
                      importDate: new Date(Date.now()),
                      importNote: 'Nhap cam co',
                      exportDate: null,
                      exportNote: ''
                    }]

                    // property is in 
                    var propertyIsIn = true

                    // property id
                    var propertyId = await createPropertyId(contractId, itemTypeId, index)

                    console.log('property id 1: ', propertyId)
                    var newItem = await createProperty(propertyMetadata, propertyInfos, propertyEvaluation, propertyStatus,
                      propertyContract, propertyOriginWarehouse, propertyCurrentWarehouse, propertyLastWarehouse, propertyMovement,
                      propertyIsIn, propertyId)
                    var property = new Property({ ...newItem })
                    console.log('new item: ', property)

                    property.save((err, result) => {
                      if (err) throw err
                    })
                  }
                })
                res.send({ message: 'Saved property successfully!', result: contractResult })
              }
            })
          } catch (err) {
            console.error(err)
          }
        }
      })
  } catch (err) {
    console.error(err)
  }

})

// get contract detail
router.get('/contracts/:id', (req, res) => {
  console.log('id received', req.params.id)
  Contract.findById(req.params.id).populate([

    {
      path: 'store.value',
      model: 'Store'
    }, {
      path: 'employee.value',
      model: 'Employee'
    },

  ]).exec((err, contractResult) => {
    if (err) throw err
    res.render('contractContent', { contractDetail: contractResult })
  })

})

// get contract checktable
router.get('/contracts/:id/checkTable', (req, res) => {
  console.log('id: ', req.params.id)
  Contract.findOne({ _id: req.params.id }).exec((err, result) => {
    Store.findOne({ _id: mongoose.Types.ObjectId(result.store.value) }).exec((err, result2) => {
      res.render('checkTable', { contract: { ...result._doc, store: result2 }, simulation: result.loanPackage.simulation })

    })
  })
})

// get contract management
router.get('/contractsManagement', (req, res) => {
  async.parallel({
    contract: callback => {
      Contract.find({}, {}, { sort: { '_id': -1 } }).populate([
        {
          path: 'store.value',
          model: 'Store'
        },
        {
          path: 'employee.value',
          model: 'Employee'
        }
      ]).exec(callback)
    },
    contractNow: callback => {
      Contract.find({}).elemMatch('contractMetadata', { 'value': formatDate(new Date(Date.now())) }).exec(callback)
    },
    property: callback => {
      Property.find({}).exec(callback)
    }
  }, (err, result2) => {
    if (err) throw err
    var propertyList = result2.property
    var contractList = result2.contract.map(contract => {
      var numberOfLatePeriods = 0,
        numberOfLateDays = 0
      // number of late periods
      if (contract.loanPackage) {
        var latePeriodsArray = contract.loanPackage.periodRecords.filter(period => {
          return period.daysBetween > 0 && period.periodStatus === false

        })
        numberOfLatePeriods = latePeriodsArray.length
        latePeriodsArray.forEach(period => {
          numberOfLateDays += period.daysBetween
        })
      }
      if (contract.loanPackage)
        return {
          contractId: contract.id,
          customerId: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customerId')),
          customer: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customer')),
          contractCreatedDate: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractCreatedDate')),
          contractEndingDate: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractEndingDate')),
          loan: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan')),
          itemType: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'itemType')),
          itemName: contract.items[0] ? contract.items[0].infos[0].value : '-',
          staticRedemptionDate: contract.loanPackage ? new Date(contract.loanPackage.periodRecords.pop().redemptionDate).getDate() : '-',
          interestRate: contract.loanPackage ? contract.loanPackage.interestRate : '-',
          employeeId: getNestedValue(findNestedObj(contract.employee, 'name', 'id')),
          employeeName: getNestedValue(findNestedObj(contract.employee, 'name', 'name')),
          accumulatedPaidInterest: contract.loanPackage ? contract.loanPackage.accumulatedPaidInterest : '-',
          incrementalPaidPrincipal: contract.loanPackage ? contract.loanPackage.incrementalPaidPrincipal : '-',
          presentValue: contract.loanPackage ? contract.loanPackage.presentValue : '-',
          contractStatus: contract.contractStatus,
          totalLoanDays: contract.loanPackage ? (contract.loanPackage.numberOfPeriods - contract.loanPackage.numberOfLoaningMoreTimes - contract.loanPackage.numberOfPayingDownTimes) * 30 : '-',
          estimatingInterest: contract.loanPackage ? contract.loanPackage.estimatingInterest : '-',
          numberOfLatePeriods,
          numberOfLateDays,
          lastPaidDate: '-',
          numberOfPayingDownTimes: contract.loanPackage ? contract.loanPackage.numberOfPayingDownTimes : '-',
          numberOfPayment: contract.loanPackage ? contract.loanPackage.periodPaymentSlip ? contract.loanPackage.periodPaymentSlip.length : '-' : '-',
          // property: getProperty(propertyList, contract.id)

        }
    })
    res.render('contractsManagement', { originalContractList: result2.contract, contractList, roleAbility: req.roleAbility, payload: req.payload, contractNow: result2.contractNow })

  })

})

// update loan package
router.put('/contracts/:id/loanPackage', (req, res) => {
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)
  Contract.findOneAndUpdate({ _id: req.params.id }, { $set: { loanPackage: req.body } }, { new: true }).exec((err, result) => {
    if (err) throw err
    res.send('Update loanpackage successfully!')
  })
})

// transaction history
router.get('/transactionHistory', (req, res) => {
  Contract.find({}).populate([
    {
      path: 'store.value',
      model: 'Store'
    },
    {
      path: 'employee.value',
      model: 'Employee'
    }
  ]).exec((err, result) => {
    if (err) throw err
    var loanPackage = result.map(res => {
      if (res.loanPackage && res.loanPackage.receiptRecords.length !== 0) {
        res.loanPackage.receiptRecords = res.loanPackage.receiptRecords.map(receipt => {
          receipt.array = receipt.array.map(recpt => {
            try {
              return {
                ...recpt,
                contract_Id: res._id,
                contractId: res.id,
                storeId: getNestedValue(findNestedObj(res.store.value.metadata, 'name', 'id')),
                storeName: getNestedValue(findNestedObj(res.store.value.metadata, 'name', 'name')),
                customerId: getNestedValue(findNestedObj(res.contractMetadata, 'name', 'customerId')),
                customerName: getNestedValue(findNestedObj(res.contractMetadata, 'name', 'customer')),
                employeeId: getNestedValue(findNestedObj(res.employee.value.metadata, 'name', 'id')),
                employeeName: getNestedValue(findNestedObj(res.employee.value.metadata, 'name', 'name')),

              }
            } catch (error) {
              console.error(error)
            }
          })
          return receipt.array

        })
        return res.loanPackage.receiptRecords
      }
    })
    try {
      res.render('transactionHistory', { loanPackage: loanPackage.flat(Infinity), contract: result })

    } catch (error) {
      console.error(error)
    }
  })
})

// receipt page
router.get('/contracts/:id/receipt', (req, res) => {
  Contract.findOne({ _id: req.params.id }).exec((err, result) => {
    if (err) throw err
    try {
      res.render('receipt', { contract: result })

    } catch (error) {
      console.error(error)
    }
  })
})

// get going to do period package
router.get('/goingToDo', (req, res) => {
  Contract.find({}).exec(async (err, result) => {
    if (err) throw err
    var goingToDoPeriodArray = []
    if (result) {
      await result.forEach(contract => {
        if (contract.loanPackage) {
          contract.loanPackage.periodRecords.forEach(period => {
            if (-10 < period.daysBetween && period.daysBetween < 0) {
              goingToDoPeriodArray.push({ ...period, contractId: contract._id })
            }
          })
        }

      })
    }
    res.render('goingToDoPeriod', { goingToDoPeriodArray })
  })
})

// get late periods
router.get('/latePeriod', (req, res) => {
  Contract.find({}).exec(async (err, result) => {
    if (err) throw err
    var latePeriodArray = []
    if (result) {
      await result.forEach(contract => {
        if (contract.loanPackage) {
          contract.loanPackage.periodRecords.forEach(period => {
            if (period.daysBetween > 0) {
              latePeriodArray.push({ ...period, contractId: contract._id })
            }
          })
        }

      })
    }
    res.render('latePeriod', { latePeriodArray })
  })
})

var job = new CronJob('0 */30 * * * *', function () {
  Contract.find({ contractStatus: 'approved' }).exec((err, result) => {
    if (err) throw err
    if (result) {
      result.forEach(contract => {
        contract.loanPackage = new Record(contract.loanPackage)
        // contract.loanPackage.reassignPeriodRecords()
        contract.loanPackage.count()
        Contract.findOneAndUpdate({ _id: contract._id }, { $set: { 'loanPackage': contract.loanPackage } }).exec((err, result) => {
          if (err) throw err
          console.log('update loan package successfully!')
        })
      })
    }
  })
})
job.start()

const getProperty = (array, value) => {
  return array.find(element => {
    if (element.contract.id === value) {
      return element.isIn

    }
  })
}

const getNestedValue = (obj) => {
  var value = obj ? (obj.value ? obj.value : '-') : '-'
  return value
}



module.exports = router;
