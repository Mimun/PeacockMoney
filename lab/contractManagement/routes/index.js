var express = require('express');
var router = express.Router();
const Item = require('../models/item');
const ItemStatus = require('../models/itemStatus');
const ContractTemplate = require('../models/contractTemplate')
const Contract = require('../models/contract');

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
  const contractTemplate = new ContractTemplate(req.body)
  contractTemplate.save((err, result) => {
    if (err) throw err
    // res.send('Saved new contract template successfully!')
    ContractTemplate.find({}, (err, result) => {
      if (err) throw err
      res.render('index', { contractTemplateList: result })
  
    })
  })
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
      res.redirect('/contracts')

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
