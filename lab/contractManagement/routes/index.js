var express = require('express');
var router = express.Router();
const Item = require('../models/item');
const ItemStatus = require('../models/itemStatus');
const ContractTemplate = require('../models/contractTemplate')
const Contract = require('../models/contract');
var fs = require('fs');

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

/* GET home page. */
router.get('/', function (req, res, next) {
  ContractTemplate.find({}, (err, result) => {
    if (err) throw err
    res.render('index', { contractTemplateList: result })

  })
})

// create new contract template route
router.post('/createNewContractTemplate', (req, res, next) => {
  // const contractTemplate = new ContractTemplate(JSON.parse(req.body.data))
  // const contractTemplate = new ContractTemplate(req.body)
  const itemObject= req.body
  const imageObj = findNestedObj(itemObject, 'name', 'image')
  console.log('body: ', imageObj.name)

  const imageExt = imageObj.value.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/')[1]
  console.log('image extension: ', imageExt)

  const base64image = imageObj.value.replace(/^data:image\/[a-z]+;base64,/, "")
  fs.writeFile(`public/images/${itemObject._id}.${imageExt}`, base64image, 'base64', (err)=>{
    if(err) console.error(err)
    findNestedObj(itemObject, 'name', 'image').value = `/images/${itemObject._id}.${imageExt}`
    const contractTemplate = new ContractTemplate(itemObject)
    contractTemplate.save((err, result)=>{
      if (err) throw err
        // res.send('Saved new contract template successfully!')
        res.send({ contractTemplateList: result })

        // ContractTemplate.find({}, (err, result) => {
        //   if (err) throw err
        //   res.send({ contractTemplateList: result })
      
        // })
    })
    console.log('data: ', itemObject)
  })
  // contractTemplate.save((err, result) => {
  //   if (err) throw err
  //   // res.send('Saved new contract template successfully!')
  //   ContractTemplate.find({}, (err, result) => {
  //     if (err) throw err
  //     res.render('index', { contractTemplateList: result })
  
  //   })
  // })
})

// create new contract route
router.post('/createNewContract', function (req, res, next) {
  Item.find({}, (err, itemResults) => {
    if (err) throw err
    ItemStatus.find({}, (err, statusResults) => {
      if (err) throw err
      res.render('createNewContract', { dbItemObjs: itemResults, dbItemStatusObjs: statusResults, itemObj: JSON.parse(req.body.data) });
    })

  })
});

// delete contract template route
router.delete('/deleteContractTemplate/:id', (req, res) => {
  // console.log('ID received: ', req.params.id)
  ContractTemplate.findOneAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) throw err
    res.send('Delete contract: ', result, ' successfully!')
  })
})

// contract list
router.get('/contracts', (req, res) => {
  Contract.find({}).populate([
    {
      path: 'item',
      model: 'Item'
    },
    {
      path: 'itemStatus',
      model: 'ItemStatus'
    }
  ]).exec((err, result2)=>{
    if(err) throw err
    res.render('contractList', {contractList: result2})

  })
})

// create new contract
router.post('/contracts', (req, res) => {
  console.log('data: ', JSON.parse(req.body.data))
  const contract = new Contract(JSON.parse(req.body.data))
  contract.save((err, result) => {
    if (err) throw err
    Contract.find({}).populate([
      {
        path: 'item',
        model: 'Item'
      },
      {
        path: 'itemStatus',
        model: 'ItemStatus'
      }
    ]).exec((err, result2)=>{
      if(err) throw err
      res.redirect('http://localhost:3000/contractMng/contracts')

    })
  })
})

// update status of a contract
router.put('/contracts/:id', (req, res)=>{
  console.log('id received: ', req.params.id)
  console.log('body: ', req.body.contractStatus)
  Contract.findOneAndUpdate({_id: req.params.id}, {$set: {"contractStatus": req.body.contractStatus}}, (err, result)=>{
    if(err) throw err
    res.send('Updated document successfully!')
  })
})

// get contract detail
router.get('/contracts/:id', (req, res)=>{
  console.log('id received', req.params.id)
  Contract.findById(req.params.id).populate([
    {path: 'item', model: 'Item'},
    {path: 'itemStatus', model: 'ItemStatus'}
  ]).exec((err, result)=>{
    if(err) throw err
    res.render('contractDetail', {contractDetail: result})
  })
  
})



module.exports = router;
