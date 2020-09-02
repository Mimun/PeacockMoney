var express = require('express');
var router = express.Router();
const Item = require('../models/item');
const ItemStatus = require('../models/itemStatus');
const ContractTemplate = require('../models/contractTemplate')
const Contract = require('../models/contract');
var fs = require('fs');
var async = require('async');
const { types } = require('util');

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
        ContractTemplate.find({}).elemMatch('templateMetadata', { 'value': value1 }).exec(callback)

      } catch (err) {
        next(err)
      }
    },
    result2: (callback) => {
      try {
        ContractTemplate.find({}).elemMatch('templateMetadata', { 'value': value2 }).exec(callback)

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
  Item.find({}, (err, itemResults) => {
    if (err) throw err
    ItemStatus.find({}, (err, statusResults) => {
      if (err) throw err
      res.render('createNewContract', { itemResults: itemResults, statusResults: statusResults, contractInfo: JSON.parse(req.body.data) });
    })

  })
});

// search item || itemstatus
router.post('/search', (req, res, next) => {
  console.log('req.body: ', req.body)
  const regex = new RegExp(escapeRegex(req.body.data), 'gi')
  async.parallel({
    itemResults: (callback) => {
      try {
        Item.find({ $or: [{ 'metadata.value': regex }, { 'infos.value': regex }] }).exec(callback)
      } catch (err) {
        next(err)
      }
    },
    itemStatusResults: (callback) => {
      try {
        ItemStatus.find({ $or: [{ 'metadata.value': regex }, { 'infos.value': regex }] }).exec(callback)

      } catch (err) {
        next(err)
      }
    }
  }, (err, result)=>{
    if(err) throw (err)
    res.send({itemResults: result.itemResults, itemStatusResults: result.itemStatusResults})
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
  Contract.find({}).populate([
    {
      path: 'items.evaluationItem',
      model: 'Item'
    },
    {
      path: 'items.status',
      model: 'ItemStatus'
    }
  ]).exec((err, result2) => {
    if (err) throw err
    res.render('contractList', { contractList: result2 })

  })
})

// create new contract
router.post('/contracts', (req, res) => {
  const contract = new Contract(JSON.parse(req.body.data))
  console.log('data: ', contract)
  contract.save((err, result) => {
    if (err) throw err
    res.redirect('http://localhost:3000/contractMng/contracts')
  })

})

// update status of a contract
router.put('/contracts/:id', (req, res) => {
  console.log('id received: ', req.params.id)
  console.log('body: ', req.body.contractStatus)
  Contract.findOneAndUpdate({ _id: req.params.id }, { $set: { "contractStatus": req.body.contractStatus } }, (err, result) => {
    if (err) throw err
    res.send('Updated document successfully!')
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
