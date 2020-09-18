var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Item = require('../models/item');
const ItemStatus = require('../models/itemStatus');
const ContractTemplate = require('../models/contractTemplate')
const Contract = require('../models/contract');
const Property = require('../models/property')
const Store = require('../models/store')
const Employee = require('../models/employee')
const Warehouse = require('../models/warehouse')

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
      if (min <= value3 && value3 <= max) {
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

// CONTRACT
// create new contract route
router.post('/createNewContract', function (req, res, next) {
  async.parallel({
    item: callback => {
      try {
        Item.find({}).exec(callback)

      } catch (err) {
        console.error(err)
      }
    },
    itemStatus: callback => {
      try {
        ItemStatus.find({}).exec(callback)

      } catch (err) {
        console.error(err)
      }
    },
    store: callback => {
      try {
        Store.find({}).exec(callback)

      } catch (err) {
        console.error(err)
      }
    }
  }, (err, result) => {
    if (err) throw err
    res.render('createNewContract', { itemResults: result.item, statusResults: result.itemStatus, contractInfo: JSON.parse(req.body.data), evaluatingItem: JSON.parse(req.body.evaluatingItem), stores: result.store });

  })

});

router.post('/getStores', (req, res, next) => {
  console.log('req.body: ', req.body)
  Employee.find({ "metadata.value": req.body.data }, (err, result) => {
    if (err) throw err
    res.send({ employeeList: result })
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

// contract list
router.get('/contracts', (req, res) => {
  Contract.find({}, {}, { sort: { '_id': -1 } }).populate([
    {
      path: 'items.evaluationItem',
      model: 'Item'
    },
    {
      path: 'items.status',
      model: 'ItemStatus'
    },
    {
      path: 'store.value',
      model: 'Store'
    },
    {
      path: 'employee.value',
      model: 'Employee'
    }
  ]).exec((err, result2) => {
    if (err) throw err
    res.render('contractList', { contractList: result2 })

  })
})

// create new contract
router.post('/contracts', async (req, res) => {
  var data = req.body



  const contract = new Contract(data)
  contract.save((err, result) => {
    if (err) throw err
    res.redirect('contracts')
  })
})

// update status of a contract
router.put('/contracts/:id', (req, res) => {
  console.log('id received: ', req.params.id)
  console.log('body: ', req.body.contractStatus)
  Contract.findOneAndUpdate({ _id: req.params.id }, { $set: { "contractStatus": req.body.contractStatus } }, { new: true }, async (err, contractResult) => {
    if (err) throw err
    if (contractResult.contractStatus === 'approved') {
      await Warehouse.findOne({"store": contractResult.store.value}).exec((err, warehouseResult)=>{
        if(err) throw err
        contractResult.items.forEach(item => {
          var newItem = {
            infos: item.infos,
            status: item.status,
            evaluationItem: item.evaluationItem,
            contract: contractResult._id,
            originWarehouse: warehouseResult._id,
            currentWarehouse: warehouseResult._id,
            movement: [warehouseResult._id]
          }
          var property = new Property(newItem)
          property.save((err, result)=>{
            if(err) throw err
            res.send({message: 'Saved property successfully!', result: contractResult})
          })
  
        })
      })
    
    }
  })
})

// get contract detail
router.get('/contracts/:id', (req, res) => {
  console.log('id received', req.params.id)
  Contract.findById(req.params.id).populate([
    {
      path: 'items.evaluationItem',
      model: 'Item'
    },
    {
      path: 'items.status',
      model: 'ItemStatus'
    }
  ]).exec((err, contractResult) => {
    if (err) throw err
    res.render('contractContent', { contractDetail: contractResult })
  })

})



module.exports = router;
