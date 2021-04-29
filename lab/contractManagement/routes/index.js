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
const ReceiptId = require('../../../models/receiptId')
const Fund = require('../../../models/fund')
const fetch = require('fetch')
const checkRole = require('../../../js/roleMiddlleware')
const { v4: uuiddv4 } = require('uuid')

const CronJob = require('cron').CronJob
require('dotenv').config()

var Record = require('../../../js/record3')
var PeriodRecord = require('../../../js/periodRecord3')
// import Record from '../../../js/record2.js'

var contractMngURL = (process.env.CONTRACTMNG || 'http://localhost:3000')

var fs = require('fs');
var async = require('async');
const { Router } = require('express');
const { resolve } = require('path');
const { reject } = require('lodash');

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

const formatDate = (date, type) => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  switch (type) {
    // id
    case (1):
      return [day, month, year].join('');
      break
    // normal formate date
    case (2):
      return [day, month, year].join('-');
      break
    case (3):
      return [year, month, day].join('-');
      break
    default:
      return [day, month, year].join('-');

  }

}

// CONTRACT TEMPLATE
// contract template list for admin
router.get('/', (req, res, next) => {
  req.url = '/contractMng/contractTemplates'
  req.type = 'GET'
  next()
}, checkRole, function (req, res, next) {
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
  req.url = '/contractMng/contractTemplates'
  req.type = 'GET'
  next()
}, checkRole, (req, res, next) => {
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
  req.url = '/contractMng/contractTemplates'
  req.type = 'POST'
  next()
}, checkRole, (req, res, next) => {
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
router.get('/contractTemplates/:id', (req, res, next) => {
  req.url = '/contractMng/contractTemplates'
  req.type = 'GET'
  req.checkStores = true
  next()
}, checkRole, (req, res) => {
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
      var queries = req.stores.map(item => {
        return { 'metadata.value': item }
      })
      console.log('STORE QUERIES: ', queries)
      if (queries.length !== 0) {
        Store.find({ $or: queries }).exec(callback)

      } else {
        Store.find({}).exec(callback)

      }
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
  var templateMetadataQueries = []
  var contractMetadataQueries = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')

    templateMetadataQueries.push({ 'metadata.value': regex })
    contractMetadataQueries.push({ 'infos.value': regex })
  })
  async.parallel({
    itemResults: (callback) => {
      try {
        Item.find({ $or: [{ $and: templateMetadataQueries }, { $and: contractMetadataQueries }] }).exec(callback)
      } catch (err) {
        next(err)
      }
    },
    itemStatusResults: (callback) => {
      try {
        ItemStatus.find({ $or: [{ $and: templateMetadataQueries }, { $and: contractMetadataQueries }] }).exec(callback)

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
router.delete('/deleteContractTemplate/:id', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'DELETE'
  next()
}, checkRole, (req, res) => {
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
// handle get contracts function
const getDaysBetween = (d1, d2) => {
  let date1 = new Date(d1)

  let date2 = new Date(d2)
  console.log({ date1, date2 })
  var oneDay = 1000 * 60 * 60 * 24
  var msDifference = date1.getTime() - date2.getTime()
  var daysDifference = Math.round(Math.abs(msDifference / oneDay)).toFixed(0)
  console.log("DAYS BETWEEN: ", daysDifference)
  return parseInt(daysDifference)
}
const handleGetContract = (contracts, properties, req) => {
  // console.log('property list: ', properties.length)

  // filter for only seeing contracts of specific stores
  var contractList = contracts.map(contract => {
    if (contract && contract.store && contract.store.value && contract.store.value.metadata) {
      console.log('value: ', findNestedObj(contract.store.value.metadata, 'name', 'id').value)
      if (req.stores.includes(findNestedObj(contract.store.value.metadata, 'name', 'id').value)) {
        return contract
      } else {
        return
      }
    } else return
  })
  // return a customized array of contract
  contractList = contractList.map(contract => {
    if (contract) {
      console.log('contracat length: ', contracts.length)
      var mergeWithObj = null
      var numberOfLatePeriods = 0,
        numberOfLateDays = 0,
        lastPaidDate = '',
        interestSoFar = 0
      // number of late periods
      if (contract.loanPackage) {
        var latePeriodsArray = contract.loanPackage.periodRecords.filter(period => {
          return period.daysBetween > 0 && period.periodStatus === false

        })
        numberOfLatePeriods = latePeriodsArray.length
        latePeriodsArray.forEach(period => {
          numberOfLateDays += period.daysBetween > 0 ? period.daysBetween : 0
        })

        lastPaidDate = contract.loanPackage.receiptRecords[contract.loanPackage.receiptRecords.length - 1] ?
          (contract.loanPackage.receiptRecords[contract.loanPackage.receiptRecords.length - 1].date) : '-'

        mergeWithObj = _.mergeWith({}, ...contract.loanPackage.periodRecords, _.add)
        switch (contract.simulation) {
          case 3:
            var numberOfPeriods = contract.periodRecords.filter(period => {
              if (new Date(period.redemptionDate).getTime() <= new Date(Date.now()).getTime()) {
                return period
              }
            })
            interestSoFar = numberOfPeriods.length * (contract.loanPackage.interestRate / 100) * contract.loanPackage.remainOrigin
            break;
          default:
            interestSoFar = (getDaysBetween(contract.loanPackage.realLifeDate, contract.loanPackage.agreementDate) + 1) * (parseFloat(contract.loanPackage.interestRate) / 100) * contract.loanPackage.remainOrigin

            break;
        }
        // console.log('merge obj: ', mergeWithObj)
      }
      // get properties
      var propertiesArray = []
      properties.forEach(property => {
        //     console.log({propertyContractId: property.contract._id,
        //     typeofPropertyContractId: typeof property.contract._id,
        //   contractId: contract._id,
        // typeofContractId: typeof contract._id})
        if (property && JSON.stringify(property.contract) === JSON.stringify(contract._id)) {
          propertiesArray.push({
            isIn: property.isIn,
            name: getNestedValue(findNestedObj(property.infos, 'name', 'Tên tài sản')),
            store: getNestedValue(findNestedObj(property.currentWarehouse.metadata, 'name', 'name'))
          })
        }
      })

      var obj = {
        contract_Id: contract._id,

        storeId: getNestedValue(findNestedObj(contract.store.value.metadata, 'name', 'id')),
        contractId: contract.id,
        customerId: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customerId')),
        customer: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customer')),
        customerPhoneNumber: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customerPhoneNumber')),
        customerSource: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customerSource')),
        contractCreatedDate: formatDate(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractCreatedDate'))),
        contractEndingDate: formatDate(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractEndingDate'))),
        loan: parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan'))) ? parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan'))) : 0,
        loanMorePayDown: contract.loanPackage ? (contract.loanPackage.loanMorePayDownRecords.length !== 1 ? (contract.loanPackage.loanMorePayDownRecords.slice(-1).pop() ? contract.loanPackage.loanMorePayDownRecords.slice(-1).pop().value : 0) : 0) : 0,
        itemType: getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'itemType')),
        itemName: getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'itemType')).split('loai')[1],
        staticRedemptionDate: contract.loanPackage ? (contract.loanPackage.periodRecords.pop() ? new Date(contract.loanPackage.periodRecords.pop().redemptionDate).getDate() : '-') : '-',
        interestRatePerMonth: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'interestRatePerMonth')),
        interestSoFar,
        millionPerDay: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'millionPerDay')),
        employeeId: getNestedValue(findNestedObj(contract.employee, 'name', 'id')),
        employeeName: getNestedValue(findNestedObj(contract.employee, 'name', 'name')),

        accumulatedPaidInterest: contract.loanPackage ? contract.loanPackage.accumulatedPaidInterest : '-',
        paidInterest: mergeWithObj ? mergeWithObj.paidInterest : 0,

        // realLiceCollectedInterest: mergeWithObj.paidInterest,
        paidPrincipal: mergeWithObj ? mergeWithObj.paidPrincipal : 0,
        realLifeCollectedPrincipal: mergeWithObj ? mergeWithObj.paidPrincipal : 0,
        remainPrincipal: mergeWithObj ? mergeWithObj.remainPrincipal : 0,
        contractStatus: contract.contractStatus,
        propertyIsIn: propertiesArray[0] ? propertiesArray[0].isIn : '-',
        propertyStore: propertiesArray[0] ? propertiesArray[0].store : '-',

        totalLoanDays: contract.loanPackage ? (contract.loanPackage.numberOfPeriods - contract.loanPackage.numberOfLoaningMoreTimes - contract.loanPackage.numberOfPayingDownTimes) * 30 : '-',
        estimatingInterest: contract.loanPackage ? contract.loanPackage.estimatingInterest : '-',

        excessInterest: mergeWithObj ? (mergeWithObj.paidInterest - mergeWithObj.interest > 0 ? mergeWithObj.paidInterest - mergeWithObj.interest : 0) : 0,
        remainInterest: mergeWithObj ? mergeWithObj.remainInterest : 0,
        numberOfLatePeriods,

        lastPaidDate: formatDate(lastPaidDate),
        numberOfLateDays,


        incrementalPaidPrincipal: contract.loanPackage ? contract.loanPackage.incrementalPaidPrincipal : '-',
        presentValue: contract.loanPackage ? contract.loanPackage.presentValue : '-',
        numberOfPayingDownTimes: contract.loanPackage ? contract.loanPackage.numberOfPayingDownTimes : '-',
        numberOfPayment: contract.loanPackage ? contract.loanPackage.periodPaymentSlip ? contract.loanPackage.periodPaymentSlip.length : '-' : '-',
        propertyName: propertiesArray[0] ? propertiesArray[0].name : '-',



      }
      // console.log('obj acb: ', obj)
      return obj
    }
  })
  return contractList
}

// get contract management
router.get('/contracts', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'GET'
  req.checkStores = true
  next()
}, checkRole, (req, res) => {
  console.log('store queries: ', req.stores)
  try {
    async.parallel({
      contract: callback => {
        Contract.find({}, {}, { sort: { '_id': -1 } }).exec(callback)
      },
      contractNow: callback => {
        Contract.find({}).elemMatch('contractMetadata', { 'value': formatDate(new Date(Date.now()), 3) }).exec(callback)
      },
      property: callback => {
        Property.find({}).populate('contract').exec(callback)
      }
    }, async (err, result2) => {
      if (err) throw err
      var propertyList = result2.property
      var contractList = await handleGetContract(result2.contract, result2.property, req)
      await res.render('contractsManagement', { originalContractList: result2.contract, contractList: contractList, roleAbility: req.roleAbility, payload: req.payload, contractNow: result2.contractNow })

    })
  } catch (error) {
    console.error(error)
  }
})

router.get('/contracts/:id', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {
  Contract.findOne({ _id: req.params.id }).exec((err, result) => {
    if (err) throw err
    res.render('contractDetail', { contract: result })
  })
})

// waiting contract list
router.get('/waitingContracts', (req, res, next) => {
  req.url = '/contractMng/waitingContracts'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {

  async.parallel({
    contract: callback => {
      Contract.find({ contractStatus: 'waiting' }, {}, { sort: { '_id': -1 } }).exec(callback)
    },
    contractNow: callback => {
      Contract.find({}).elemMatch('contractMetadata', { 'value': formatDate(new Date(Date.now())) }).exec(callback)
    }
  }, (err, result2) => {
    if (err) throw err
    res.render('contractList', { contractList: result2.contract, roleAbility: req.roleAbility, payload: req.payload, contractNow: result2.contractNow })

  })

})

// pending contract list
router.get('/pendingContracts', (req, res, next) => {
  req.url = '/contractMng/pendingContracts'
  req.type = 'GET'
  req.checkMember = true

  next()
}, checkRole, (req, res) => {
  console.log('is check member: ', req.isCheckMember)
  console.log('is approve member: ', req.isApproveMember)

  async.parallel({
    contract: callback => {
      Contract.find({ contractStatus: 'pending' }, {}, { sort: { '_id': -1 } }).exec(callback)
    },
    contractNow: callback => {
      Contract.find({}).elemMatch('contractMetadata', { 'value': formatDate(new Date(Date.now())) }).exec(callback)
    }
  }, (err, result2) => {
    if (err) throw err
    res.render('pendingContractList', {
      contractList: result2.contract, roleAbility: req.roleAbility,
      payload: req.payload, contractNow: result2.contractNow, isCheckMember: req.isCheckMember, isApproveMember: req.isApproveMember
    })

  })
})

// create new contract
router.post('/contracts', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'POST'
  next()
}, checkRole, (req, res) => {
  var data = req.body
  var storeId = getNestedValue(findNestedObj(data.store, 'name', 'store'))
  console.log('data: ', storeId)

  var employeeId = getNestedValue(findNestedObj(data.employee, 'name', 'employee'))
  try {
    async.parallel({
      store: callback => {
        Store.findOne({ _id: storeId }).exec(callback)
      },
      employee: callback => {
        Employee.findOne({ _id: employeeId }).exec(callback)
      },
      contractsInStore: callback => {
        Contract.find({ 'store.value._id': mongoose.Types.ObjectId(storeId) }).exec(callback)
      }
    }, (err, results) => {
      if (err) throw err
      console.log('contract in store: ', results.contractsInStore.length)
      data.store.value = results.store
      data.employee.value = results.employee
      var storeCustomId = getNestedValue(findNestedObj(results.store, 'name', 'id'))
      data.id = `${storeCustomId}.${formatDate(new Date(Date.now()), 1)}.${results.contractsInStore.length}`
      const contract = new Contract(data)
      console.log('new contract id: ', data.id)
      try {
        contract.save((err, result) => {
          if (err) throw err
          res.send({ contract: result })
        })
      } catch (error) {
        console.error(error)
      }
    })
  } catch (error) {

  }

})

// create new multiple contracts
router.post('/contractArray', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'POST'
  next()
}, checkRole, (req, res) => {
  var data = req.body
  console.log('req body: ', req.body)
  try {
    data.forEach(item => {
      var storeId = getNestedValue(findNestedObj(item.store, 'name', 'store'))
      var employeeId = getNestedValue(findNestedObj(item.employee, 'name', 'employee'))
      try {
        async.parallel({
          store: callback => {
            Store.findOne({ 'metadata.value': storeId }).exec(callback)
          },
          employee: callback => {
            Employee.findOne({ 'metadata.value': employeeId }).exec(callback)
          }
        }, (err, results) => {
          if (err) throw err
          item.store.value = results.store
          item.employee.value = results.employee
          const contract = new Contract(item)
          try {
            contract.save((err, result) => {
              if (err) throw err
            })
          } catch (error) {
            console.error(error)
          }
        })
      } catch (error) {

      }
    })
    res.send('Saved contract successfully!')

  } catch (error) {
    res.send('Saved contract unsuccessfully!')
  }



})


// search contract
router.post('/contracts/search', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'GET'
  req.checkStores = true
  next()
}, checkRole, (req, res) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var templateMetadataQueries = []
  var contractMetadataQueries = []
  var idQueries = []
  var contractStatusQueries = []
  var employeeQueries = []
  var itemQueries = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')
    templateMetadataQueries.push({ 'templateMetadata.value': regex })
    contractMetadataQueries.push({ 'contractMetadata.value': regex })
    idQueries.push({ 'id': regex })
    contractStatusQueries.push({ 'contractStatus': regex })
    employeeQueries.push({ 'employee.value.metadata.value': regex })
    itemQueries.push({ 'items.infos.value': regex })
  })
  async.parallel({
    contracts: callback => {
      Contract.find({
        $or: [{ $and: templateMetadataQueries }, { $and: contractMetadataQueries },
        { $and: idQueries }, { $and: contractStatusQueries },
        { $and: employeeQueries }]
      }).exec(callback)
    },
    properties: callback => {
      Property.find({}).populate('contract').exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    console.log('result after searching: ', results)
    var contractList = handleGetContract(results.contracts, results.properties, req)
    res.send({ contractList })

  })


})

// delete contract
router.delete('/contracts/:id', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'DELETE'
  next()
}, checkRole, (req, res, next) => {
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

const createId = () => {
  return uuiddv4()
}

// update status of a contract
router.put('/contracts/:id', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'PUT'
  next()
}, checkRole, async (req, res) => {
  console.log('id received: ', req.params.id)
  console.log('body: ', req.body)
  var token = req.headers['x-access-token'].split(' ')[1].trim()
  console.log('req token: ', token)
  var loanPackage = null
  try {
    if (req.body.contractStatus === 'approved') {
      var contract = req.body.contract
      var contractId = contract.id
      var storeId = getNestedValue(findNestedObj(contract.store.value.metadata, 'name', 'id'))
      var storeName = getNestedValue(findNestedObj(contract.store.value.metadata, 'name', 'name'))
      var customerId = getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customerId'))
      var customerName = getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customer'))
      var employeeId = getNestedValue(findNestedObj(contract.employee.value.metadata, 'name', 'id'))
      var employeeName = getNestedValue(findNestedObj(contract.employee.value.metadata, 'name', 'name'))
      var interestRate = getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'paymentMethod')) !== '3' ? parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'interestRate'))) : parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'interestRatePerMonth')))
      var presentValue = parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan')))
      var agreementDate = new Date(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractCreatedDate')))
      var numberOfPeriods = parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'numberOfAcceptanceTerms')))
      var ruleArray = contract.penaltyRules
      var blockArray = contract.blockRules
      var realLifeDate = new Date(formatDate(Date.now(), 3))
      var simulation = parseInt(getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'paymentMethod')))
      loanPackage = new Record({
        interestRate, presentValue, agreementDate,
        numberOfPeriods, ruleArray, blockArray, realLifeDate, simulation, contractId, storeId, storeName,
        customerId, customerName, employeeId, employeeName
      })
      await loanPackage.createPeriodRecords()
      await loanPackage.pushLoanMorePayDownHistory({
        id: `${loanPackage.contractId}.${formatDate(loanPackage.agreementDate, 1)}`,
        date: loanPackage.agreementDate,
        value: -loanPackage.presentValue,

      })
      var object2 = {
        id: createId(),
        root: 0,
        paid: loanPackage.presentValue,
        remain: 0,
        receiptId: 'C-Giải ngân mới',
        receiptReason: `Giải ngân`,
        date: new Date(loanPackage.realLifeDate),
        type: 'cash',
        receiptType: 2,
        from: loanPackage.storeId,
        to: loanPackage.customerId,
        storeId: loanPackage.storeId,
        storeName: loanPackage.storeName,
        customerId: loanPackage.customerId,
        customerName: loanPackage.customerName,
        employeeId: loanPackage.employeeId,
        employeeName: loanPackage.employeeName,
        contractId: loanPackage.contractId,
        isLoanMoreOrPayDownReceipt: true,

      }
      loanPackage.receiptRecords.push(object2)
      fetch.fetchUrl(`${contractMngURL}/contractMng/funds2?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify([object2])
      }, (err, meta, result) => {
        if (result)
          console.log('result: ', result.toString())
      })
    }

    var updateQuery = { $set: { 'contractStatus': req.body.contractStatus } }
    loanPackage ? updateQuery.$set.loanPackage = loanPackage : null
    loanPackage ? updateQuery.$set.originalLoanPackage = loanPackage : null
    req.body.likes ? updateQuery.$set.likes = req.body.likes : null
    try {
      Contract.findOneAndUpdate({ _id: req.params.id }, updateQuery, { new: true })
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
                  try {
                    Warehouse.findOne({ store: contractResult.store.value }).exec(callback)

                  } catch (error) {

                  }
                },
                storeResult: callback => {
                  try {
                    Store.findOne({ _id: contractResult.store.value }).exec(callback)

                  } catch (error) {

                  }
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
                        warehouseFrom: 'Hợp đồng',
                        warehouseTo: findNestedObj(results.warehouseResult, 'name', 'name') ? findNestedObj(results.warehouseResult, 'name', 'name').value : 'None',
                        importDate: new Date(Date.now()),
                        importNote: 'Nhập cầm cố',
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
          } else {
            res.send('Saved successfully!')
          }
        })
    } catch (err) {
      console.error(err)
    }
  } catch (error) {
    console.error(error)
  }
})

// get contract detail
router.get('/contracts/:id/print', (req, res, next) => {
  req.url = '/contractMng/contracts'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {
  console.log('id received', req.params.id)
  Contract.findById(req.params.id).exec((err, contractResult) => {
    if (err) throw err
    res.render('contractContent', { contractDetail: contractResult })
  })

})

// get contract checktable
router.get('/contracts/:id/checkTable', (req, res) => {
  console.log('id: ', req.params.id)
  try {
    Contract.findOne({ _id: req.params.id }).exec((err, result) => {
      console.log('id: ', findNestedObj(result.store.value.metadata, 'name', 'id'))
      try {
        async.parallel({
          store: callback => {
            Store.findOne({ _id: mongoose.Types.ObjectId(result.store._id) }).exec(callback)
          },
          receiptIds: callback => {
            ReceiptId.find({}).exec(callback)
          }
        }, (err, results) => {
          res.render('checkTable', {
            contract: result,
            simulation: result.loanPackage ? result.loanPackage.simulation : 0,
            receiptIds: results.receiptIds

          })
        })

      } catch (error) {
        console.error(error)
      }

    })
  } catch (error) {
    console.error(error)
  }
})

// update loan package
router.put('/contracts/:id/loanPackage', (req, res) => {
  console.log('id: ', req.params.id)
  var updateQuery = { $set: { loanPackage: req.body } }
  req.body.presentValue === 0 ? updateQuery.$set.contractStatus = 'completed' : null

  try {
    Contract.findOneAndUpdate({ _id: req.params.id }, updateQuery, { new: true }).exec((err, result) => {
      if (err) throw err
      res.send('Update loanpackage successfully!')
    })
  } catch (error) {
    console.error(error)
  }

})

// flat function
Object.defineProperty(Array.prototype, 'flat', {
  value: function (depth = 1) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  }
});

// transaction history(funds)
router.get('/transactionHistory', (req, res, next) => {
  req.url = '/contractMng/transactionHistory'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {
  async.parallel({
    contracts: callback => {
      Contract.find({}).exec(callback)
    },
    funds: callback => {
      Fund.find({}).exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    try {
      res.render('transactionHistory', {
        loanPackage: _.flatten(results.contracts.loanPackage),
        contract: results.contracts,
        fund: results.funds
      })

    } catch (error) {
      console.error(error)
    }
  })

})

// receipt page
router.get('/contracts/:id/receipt', (req, res, next) => {
  req.url = '/systemMng/receiptId'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {
  console.log('req query: ', req.query)
  try {
    Contract.findOne({ _id: req.params.id }).exec((err, result) => {
      if (err) throw err
      try {
        res.render('receipt', { contract: result, date: req.query.date })

      } catch (error) {
        console.error(error)
      }
    })
  } catch (error) {
    console.error(error)
  }

})

router.get('/funds/receipt', (req, res) => {
  console.log('receipt query: ', req.query)
  res.render('fundReceipt', { receipt: JSON.parse(req.query.receipt) })
})

// get going to do period package
router.get('/goingToDo', (req, res, next) => {
  req.url = '/contractMng/goingToDo'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {
  try {
    Contract.find({}).exec(async (err, result) => {
      if (err) throw err
      var goingToDoPeriodArray = []
      if (result) {
        await result.forEach(contract => {
          if (contract.loanPackage) {
            contract.loanPackage.periodRecords.forEach(period => {
              if (-10 < period.daysBetween && period.daysBetween < 0) {
                goingToDoPeriodArray.push({ ...period, contractId: contract._id, daysBetween: period.daysBetween.toFixed(0) })
              }
            })
          }

        })
      }
      res.render('goingToDoPeriod', { goingToDoPeriodArray })
    })
  } catch (error) {
    console.error(error)
  }

})

// get late periods
router.get('/latePeriod', (req, res, next) => {
  req.url = '/contractMng/latePeriod'
  req.type = 'GET'
  next()
}, checkRole, (req, res) => {
  try {
    Contract.find({}).exec(async (err, result) => {
      if (err) throw err
      var latePeriodArray = []
      if (result) {
        await result.forEach(contract => {
          if (contract.loanPackage) {
            contract.loanPackage.periodRecords.forEach(period => {
              if (period.daysBetween > 0) {
                latePeriodArray.push({ ...period, contractId: contract._id, daysBetween: period.daysBetween.toFixed(0) })
              }
            })
          }

        })
      }
      res.render('latePeriod', { latePeriodArray })
    })
  } catch (error) {
    console.error(error)
  }
})

// update fund (pending)
router.post('/funds/pending', (req, res, next) => {
  req.url = '/contractMng/transactionHistory'
  req.type = 'POST'
  next()
}, checkRole, (req, res) => {
  var obj = req.body
  console.log('req.body', req.body)
  async.parallel({
    fundFrom: callback => {
      // var id = mongoose.Types.ObjectId.isValid(req.body.from) ? mongoose.Types.ObjectId(req.body.from) : null
      var id = obj.from
      console.log('id from: ', id)

      if (id) {
        Fund.findOne({ storeId: id }).exec(callback)
      } else {
        callback(null, {})
      }
    },
  }, (err, results) => {
    if (err) throw err
    console.log('results: ', results)
    var fundFrom = results.fundFrom
    try {
      if (fundFrom && !_.isEmpty(fundFrom)) {
        fundFrom.pendingReceiptRecords.push({ ...obj, paid: -obj.paid, receiptType: 2, receiptId: 'C-Chuyển NB', receiptReason: 'Chuyển NB' })
      }
      async.parallel({
        fundFrom: callback => {
          if (fundFrom) {
            Fund.findOneAndUpdate({ _id: fundFrom._id }, { $set: fundFrom }).exec(callback)

          } else {
            callback(null, {})
          }
        }
      }, (err, results) => {
        if (err) throw err
        res.send('save successfully')
      })
    } catch (error) {
      console.error(error)
    }
  })
})

// update fund (approved)
router.post('/funds/approve', (req, res) => {
  var obj = req.body
  console.log('req.body', req.body)
  async.parallel({
    fundFrom: callback => {
      // var id = mongoose.Types.ObjectId.isValid(req.body.from) ? mongoose.Types.ObjectId(req.body.from) : null
      var id = obj.from
      console.log('id from: ', id)

      if (id) {
        Fund.findOne({ storeId: id }).exec(callback)
      } else {
        callback(null, {})
      }
    },
    fundTo: callback => {
      var id = obj.to
      console.log('id to: ', id)

      if (id) {
        Fund.findOne({ storeId: id }).exec(callback)

      } else {
        callback(null, {})
      }

    }
  }, (err, results) => {
    if (err) throw err
    console.log('results: ', results)
    var fundFrom = results.fundFrom
    var fundTo = results.fundTo
    try {
      var receivingObj = {
        ...obj,
        from: obj.to,
        to: obj.from,
        storeId: obj.customerId,
        storeName: obj.customerName,
        customerId: obj.storeId,
        customerName: obj.storeName,
      }
      switch (obj.type) {
        case ('cash'):
          if (fundFrom && !_.isEmpty(fundFrom)) {
            fundFrom.cash = parseFloat(fundFrom.cash) - Math.abs(parseFloat(obj.paid))
            fundFrom.receiptRecords.push({ ...obj, paid: -Math.abs(obj.paid), receiptType: 2, receiptId: 'C-Chuyển NB', receiptReason: 'Chuyển NB' })
            fundFrom.pendingReceiptRecords = fundFrom.pendingReceiptRecords.filter(elem => {
              if (!_.isEqual(elem, obj)) {
                console.log('is not equal')
                return elem
              } else {
                console.log('is equal')
              }
              return
            })
          }

          if (fundTo && !_.isEmpty(fundTo)) {
            fundTo.cash = parseFloat(fundTo.cash) + Math.abs(parseFloat(obj.paid))
            fundTo.receiptRecords.push({ ...receivingObj, paid: +Math.abs(receivingObj.paid), receiptType: 1, receiptId: 'T-Nhận NB', receiptReason: 'Nhận NB' })
          }
          break
        case ('iCash'):
          if (fundFrom && !_.isEmpty(fundFrom)) {
            fundFrom.iCash = parseFloat(fundFrom.iCash) - Math.abs(parseFloat(obj.paid))
            fundFrom.receiptRecords.push({ ...obj, paid: -Math.abs(obj.paid), receiptType: 2, receiptId: 'C-Chuyển NB', receiptReason: 'Chuyển NB' })
            fundFrom.pendingReceiptRecords = fundFrom.pendingReceiptRecords.filter(elem => {
              if (!_.isEqual(elem, obj)) {
                console.log('is not equal')
                return elem
              } else {
                console.log('is equal')
              }
              return
            })
          }

          if (fundTo && !_.isEmpty(fundTo)) {
            fundTo.iCash = parseFloat(fundTo.iCash) + Math.abs(parseFloat(obj.paid))
            fundTo.receiptRecords.push({ ...receivingObj, paid: +Math.abs(receivingObj.paid), receiptType: 1, receiptId: 'T-Nhận NB', receiptReason: 'Nhận NB' })
          }
          break
        default:
      }
      console.log('fund from after transferring: ', fundFrom)
      console.log('fund to after transferring: ', fundTo)

      async.parallel({
        fundFrom: callback => {
          if (fundFrom) {
            Fund.findOneAndUpdate({ _id: fundFrom._id }, { $set: fundFrom }, { new: true }).exec(callback)

          } else {
            callback(null, {})
          }
        },
        fundTo: callback => {
          if (fundTo) {
            Fund.findOneAndUpdate({ _id: fundTo._id }, { $set: fundTo }, { new: true }).exec(callback)

          } else {
            callback(null, {})
          }
        }
      }, (err, results) => {
        if (err) throw err
        res.send({ fundFrom: results.fundFrom.receiptRecords[results.fundFrom.receiptRecords.length - 1], fundTo: results.fundTo.receiptRecords[results.fundTo.receiptRecords.length - 1] })
      })
    } catch (error) {
      console.error(error)
    }
  })
})

// update fund (deny)
router.post('/funds/deny', (req, res) => {
  var obj = req.body
  console.log('req.body', req.body)
  async.parallel({
    fundFrom: callback => {
      // var id = mongoose.Types.ObjectId.isValid(req.body.from) ? mongoose.Types.ObjectId(req.body.from) : null
      var id = obj.from
      if (id) {
        Fund.findOne({ storeId: id }).exec(callback)
      } else {
        callback(null, {})
      }
    },
  }, (err, results) => {
    if (err) throw err
    var fundFrom = results.fundFrom
    try {
      var newPendingReceiptRecords = []
      if (fundFrom && !_.isEmpty(fundFrom)) {
        newPendingReceiptRecords = fundFrom.pendingReceiptRecords.filter(elem => {
          if (!_.isEqual(elem, obj)) {
            console.log('is not equal')
            return elem
          } else {
            console.log('is equal')
          }
          return
        })
      }

      async.parallel({
        fundFrom: callback => {
          if (fundFrom) {
            Fund.findOneAndUpdate({ _id: fundFrom._id }, { $set: { 'pendingReceiptRecords': newPendingReceiptRecords } }).exec(callback)

          } else {
            callback(null, {})
          }
        }
      }, (err, results) => {
        if (err) throw err
        res.send('save successfully')
      })
    } catch (error) {
      console.error(error)
    }
  })
})

// update fund when approving a contract
router.post('/funds2', async (req, res) => {
  var objs = req.body

  await new Promise((resolve, reject) => {
    objs.map(async obj => {
      console.log('OBJ', obj)

      if (obj) {
        await new Promise((resolve, reject) => {
          async.parallel({
            fundFrom: callback => {
              // var id = mongoose.Types.ObjectId.isValid(req.body.from) ? mongoose.Types.ObjectId(req.body.from) : null
              var id = obj.from

              if (id) {
                Fund.findOne({ storeId: id }).exec(callback)
              } else {
                callback(null, {})
              }
            },
            fundTo: callback => {
              var id = obj.to

              if (id) {
                Fund.findOne({ storeId: id }).exec(callback)

              } else {
                callback(null, {})
              }

            }
          }, async (err, results) => {
            if (err) throw err
            var fundFrom = results.fundFrom
            var fundTo = results.fundTo
            console.log('fundFrom: ', fundFrom)
            console.log('fundTo: ', fundTo)

            await new Promise((resolve, reject) => {
              try {
                switch (obj.type) {
                  case ('cash'):
                    if (fundFrom && !_.isEmpty(fundFrom)) {
                      updateFund(fundFrom._id, { $inc: { 'cash': -parseFloat(obj.paid) }, $push: { 'receiptRecords': { ...obj, paid: -obj.paid } } })
                    }

                    if (fundTo && !_.isEmpty(fundTo)) {
                      updateFund(fundTo._id, { $inc: { 'cash': +parseFloat(obj.paid) }, $push: { 'receiptRecords': { ...obj, paid: +obj.paid } } })
                    }
                    break
                  case ('iCash'):
                    if (fundFrom && !_.isEmpty(fundFrom)) {
                      updateFund(fundFrom._id, { $inc: { 'iCash': -parseFloat(obj.paid) }, $push: { 'receiptRecords': { ...obj, paid: -obj.paid } } })
                    }

                    if (fundTo && !_.isEmpty(fundTo)) {
                      updateFund(fundTo._id, { $inc: { 'iCash': +parseFloat(obj.paid) }, $push: { 'receiptRecords': { ...obj, paid: +obj.paid } } })
                    }
                    break
                  default:
                }
              } catch (error) {
                console.error(error)
              }
            })
          })
        })
      }
    })
    resolve()
  }).then(() => {
    res.send('Save successfully!')

  })

})

// update fund when removing receipts
router.post('/funds3', async (req, res) => {
  var objs = req.body
  console.log('BODY: ', objs)
  await new Promise((resolve, reject) => {
    objs.map(async obj => {
      if (obj) {
        await new Promise((resolve, reject) => {
          async.parallel({
            fundFrom: callback => {
              // var id = mongoose.Types.ObjectId.isValid(req.body.from) ? mongoose.Types.ObjectId(req.body.from) : null
              var id = obj.from

              if (id) {
                Fund.findOne({ storeId: id }).exec(callback)
              } else {
                callback(null, {})
              }
            },
            fundTo: callback => {
              var id = obj.to

              if (id) {
                Fund.findOne({ storeId: id }).exec(callback)

              } else {
                callback(null, {})
              }

            }
          }, async (err, results) => {
            if (err) throw err
            var fundFrom = results.fundFrom
            var fundTo = results.fundTo
            console.log('fundFrom: ', fundFrom)
            console.log('fundTo: ', fundTo)
            await new Promise((resolve, reject) => {
              try {
                switch (obj.type) {
                  case ('cash'):
                    if (fundFrom && !_.isEmpty(fundFrom)) {
                      updateFund(fundFrom._id, { $inc: { 'cash': -parseFloat(obj.paid) }, $pull: { 'receiptRecords': { id: obj.id } } })
                    }

                    if (fundTo && !_.isEmpty(fundTo)) {
                      updateFund(fundTo._id, { $inc: { 'cash': -parseFloat(obj.paid) }, $pull: { 'receiptRecords': { id: obj.id } } })
                    }
                    break
                  case ('iCash'):
                    if (fundFrom && !_.isEmpty(fundFrom)) {
                      updateFund(fundFrom._id, { $inc: { 'iCash': -parseFloat(obj.paid) }, $pull: { 'receiptRecords': { id: obj.id } } })
                    }

                    if (fundTo && !_.isEmpty(fundTo)) {
                      updateFund(fundTo._id, { $inc: { 'iCash': -parseFloat(obj.paid) }, $pull: { 'receiptRecords': { id: obj.id } } })
                    }
                    break
                  default:
                }
              } catch (error) {
                console.error(error)
              }
            })
          })
        })
      }
    })
    resolve()
  }).then(() => {
    res.send('Save successfully!')

  })
})

const updateFund = async (id, queries) => {
  // return new Promise((resolve, reject) => {
  //   Fund.findOneAndUpdate({ _id: fund._id }, { $set: fund }).exec((err, result) => {
  //     if (err){
  //       reject()
  //       throw err
  //     } else {
  //       resolve()
  //     }

  //   })
  // })
  // { $inc: fund, $push: { 'receiptRecords': obj } }
  await new Promise((resolve, reject) => {
    Fund.findOneAndUpdate({ _id: id }, queries, { new: true }).exec(async (err, result) => {
      if (err) throw err
      if (result) {
        console.log('yes')
        resolve()
      } else {
        console.log('no')

        reject()
      }
    })
  })
}
// 0 0 * * *
var job = new CronJob('0 0 * * *', function () {
  try {
    Contract.find({ contractStatus: 'approved' }).exec((err, result) => {
      if (err) throw err
      if (result) {
        result.forEach(contract => {
          // console.log('abcdefghi: ', contract.loanPackage)
          try {
            contract.loanPackage = new Record(contract.loanPackage)
            // contract.loanPackage.reassignPeriodRecords()
            contract.loanPackage.count()
            Contract.findOneAndUpdate({ _id: contract._id }, { $set: { 'loanPackage': contract.loanPackage } }).exec((err, result) => {
              if (err) throw err
              console.log('update loan package successfully!')
            })
          } catch (error) {
            console.error(error)
          }
        })
      }
    })
  } catch (error) {
    console.error(error)
  }
})
job.start()



module.exports = router;
