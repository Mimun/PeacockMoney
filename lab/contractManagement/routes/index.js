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

var fs = require('fs');
var async = require('async');
const auth = require('../../authentication/routes/checkAuthentication');
const { format } = require('path');

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
  ContractTemplate.find({}, (err, result) => {
    if (err) throw err
    res.render('index', { contractTemplateList: result })

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
      // res.send('Saved new contract template successfully!')
      res.send({ contractTemplateList: result })


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
    console.log('results: ', result.representatives)
    // find representative
    if (result) {
      async.parallel({
        representatives: callback => {
          Employee.find({ _id: { $in: result.representatives } }).exec(callback)
        },
        employees: callback => {
          Employee.find({ "metadata.value": result._id }).exec(callback)
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
  console.log('contract items; ', contract.items)
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
const createProperty = (metadata, infos, status, evaluationItem = null, contract = null,
  originWarehouse = null, currentWarehouse = null, movement = [],
  importDate = new Date(Date.now()), exportDate = null) => {
  return {
    metadata,
    infos,
    status,
    evaluationItem,
    contract,
    originWarehouse,
    currentWarehouse,
    movement,
    importDate,
    exportDate,
    
  }
}

// function to generate property id
const createPropertyId = (contractId, itemTypeId, index=0) => {
  return `${itemTypeId !== '' ? itemTypeId : 'None'}.${contractId !== '' ? contractId : 'None'}.${index}`
}

// update status of a contract
router.put('/contracts/:id', async (req, res) => {
  console.log('id received: ', req.params.id)
  console.log('body: ', req.body.contractStatus)
  try {
    await Contract.findOneAndUpdate({ _id: req.params.id }, { $set: { "contractStatus": req.body.contractStatus } }, { new: true }, async (err, contractResult) => {
      if (err) throw err
      var contractId = contractResult.id
      var itemTypeId = findNestedObj(contractResult.templateMetadata, 'name', 'itemTypeId') ?
        findNestedObj(contractResult.templateMetadata, 'name', 'itemTypeId').value : "None"
      console.log('contarct id: ', contractId)
      console.log('itemtype id: ', itemTypeId)

      // add property only when the contract is approved
      if (contractResult.contractStatus === 'approved') {
        try {
          await Warehouse.findOne({ store: contractResult.store.value }).exec(async (err, warehouseResult) => {
            if (err) throw err
            if (contractResult.items.length !== 0) {
              await contractResult.items.forEach(async (item, index) => {
                var propertyId = await createPropertyId(contractId, itemTypeId, index)
                if (warehouseResult) {
                  
                  console.log('property id 1: ', propertyId)
                  var newItem = await createProperty(item.evaluationItem ? item.evaluationItem.metadata : [null],
                    item.infos, item.status, item.evaluationItem, contractResult._id,
                    warehouseResult._id, warehouseResult._id, [warehouseResult._id])
                  var property = new Property({...newItem, id: propertyId})
                  console.log('new item: ', property.id)

                  property.save((err, result) => {
                    if (err) throw err
                  })
                } else {
                  console.log('property id 2: ', propertyId)

                  var newItem = createProperty(item.evaluationItem ? item.evaluationItem.metadata : [null],
                    item.infos, item.status, item.evaluationItem, contractResult._id,
                    contractResult.store.value, contractResult.store.value, [contractResult.store.value])

                  var property = new Property({...newItem, id: propertyId})
                  console.log('new item 2: ', property.id)


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



module.exports = router;
