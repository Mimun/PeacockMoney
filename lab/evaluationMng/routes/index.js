var express = require('express');
var router = express.Router();
var Item = require('../models/item')
var ItemStatus = require('../models/itemStatus')

/* GET home page. */
router.get('/', function (req, res, next) {
  Item.find({}, (err, results) => {
    if (err) throw err
    res.render('index', { dbItemObjs: results });

  })
});

// item
router.post('/items', (req, res) => {
  var itemObjsArray = req.body
  var array = []
  itemObjsArray.map(itemObj => {
    Item.findOneAndUpdate({ _id: itemObj._id }, { $set: { "infos": itemObj.infos } }, (err, result) => {
      if (err) throw err
      if (result) {
        console.log('Updated successfully!')
        array.push(itemObj)
      } else {
        var item = new Item({
          metadata: itemObj.metadata,
          infos: itemObj.infos
        })
        array.push(item)

        item.save((err, result) => {
          if (err) throw err
          else {
            console.log('Saved to db successfully!')

          }
        })
      }

    })

  })
  console.log('array: ', array)

})

router.post('/createItem', (req, res) => {
  console.log(req.body)
  var item = new Item(req.body)
  item.save((err, result) => {
    if (err) throw err
    if (result) {
      res.send('Saved new item successfully')

    } else {
      res.send('Failed to save new item')
    }
  })
})

router.delete('/items/:id', (req, res)=>{
  console.log(req.params.id)
  Item.findByIdAndDelete({_id: req.params.id}, (err, result)=>{
    if(err) throw err
    if(result){
      res.send({message: "Delete item successfully", isDeleted: true})
    } else {
      res.send({message: "Failed to delete item", isDeleted: false})
    }
  })
})

router.put('/items/:id', (req, res)=>{
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)
  

  Item.findByIdAndUpdate({_id: req.params.id}, { $set: { "infos": req.body.infos }}, (err, result)=>{
    if(err) throw err
    if(result){
      res.send({message: 'Update item successfully', isUpdated: true})

    } else {
      res.send({message: 'Failed to update item', isUpdated: false})

    }
  })
})

// item status
router.get('/itemStatus', function (req, res, next) {
  ItemStatus.find({}, (err, results) => {
    if (err) throw err
    res.render('itemStatus', { dbItemObjs: results });

  })
});

router.post('/itemStatus', (req, res) => {
  var itemObjsArray = req.body
  itemObjsArray.forEach(item=>{
    console.log('array: ', JSON.stringify(item))

  })

  var array = []
  itemObjsArray.map(itemObj => {
    ItemStatus.findOneAndUpdate({ _id: itemObj._id }, { $set: { "infos": itemObj.infos } }, (err, result) => {
      if (err) throw err
      if (result) {
        console.log('Updated successfully!')
        array.push(itemObj)
      } else {
        var item = new ItemStatus({
          metadata: itemObj.metadata,
          infos: itemObj.infos,
          _id: itemObj._id
        })
        array.push(item)

        item.save((err, result) => {
          if (err) throw err
          else {
            console.log('Saved to db successfully!')

          }
        })
      }

    })

  })
})

router.post('/createItemStatus', (req, res) => {
  console.log(req.body)
  var item = new ItemStatus(req.body)
  item.save((err, result) => {
    if (err) throw err
    if (result) {
      res.send('Saved new item successfully')

    } else {
      res.send('Failed to save new item')
    }
  })
})

router.delete('/itemStatus/:id', (req, res)=>{
  console.log(req.params.id)
  ItemStatus.findByIdAndDelete({_id: req.params.id}, (err, result)=>{
    if(err) throw err
    if(result){
      res.send({message: "Delete item successfully", isDeleted: true})
    } else {
      res.send({message: "Failed to delete item", isDeleted: false})
    }
  })
})

router.put('/itemStatus/:id', (req, res)=>{
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)
  

  ItemStatus.findByIdAndUpdate({_id: req.params.id}, { $set: { "infos": req.body.infos }}, (err, result)=>{
    if(err) throw err
    if(result){
      res.send({message: 'Update item successfully', isUpdated: true})

    } else {
      res.send({message: 'Failed to update item', isUpdated: false})

    }
  })
})

// evaluation
router.get('/evaluation', (req, res)=>{
  Item.find({}, (err, itemResults) => {
    if (err) throw err
    ItemStatus.find({}, (err, itemStatusResults)=>{
      res.render('evaluation', { itemResults: itemResults, itemStatusResults: itemStatusResults });

    })

  })
})

module.exports = router;
