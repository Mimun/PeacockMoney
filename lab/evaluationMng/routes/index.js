var express = require('express');
var router = express.Router();
var Item = require('../models/item')
var ItemStatus = require('../models/itemStatus');
var async = require('async')
const { cssNumber } = require('jquery');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// item
/* GET home page. */
router.get('/', function (req, res, next) {
  Item.find({}, (err, results) => {
    if (err) throw err
    res.render('index', { dbItemObjs: results });

  })
});

// upload items
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

// create new item
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

// delete an item
router.delete('/items/:id', (req, res) => {
  console.log(req.params.id)
  Item.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) throw err
    if (result) {
      res.send({ message: "Delete item successfully", isDeleted: true })
    } else {
      res.send({ message: "Failed to delete item", isDeleted: false })
    }
  })
})

// update an item
router.put('/items/:id', (req, res) => {
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)


  Item.findByIdAndUpdate({ _id: req.params.id }, { $set: { "infos": req.body.infos } }, (err, result) => {
    if (err) throw err
    if (result) {
      res.send({ message: 'Update item successfully', isUpdated: true })

    } else {
      res.send({ message: 'Failed to update item', isUpdated: false })

    }
  })
})

// search items
router.post('/items/search', (req, res) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')

    arrayMetadataConditions.push({ 'metadata.value': regex })
    arrayInfosConditions.push({ 'infos.value': regex })
  })
  console.log('array metadata condition: ', arrayMetadataConditions)
  console.log('array infos condition: ', arrayInfosConditions)
  Item.find({ $or: [{ $and: arrayMetadataConditions }, { $and: arrayInfosConditions }] }).exec((err, results) => {
    if (err) throw err
    res.send({ itemResults: results })

  })

  // var resultArray = []
  // for (var i = 0; i < arrayValue.length; i++) {
  //   const regex = new RegExp(escapeRegex(arrayValue[i]), 'gi')
  //   console.log('search: ', regex)
  //   Item.find({ $and: [{ 'metadata.value': regex }, { 'infos.value': regex }] }).exec((err, results)=>{
  //     if(err) throw err
  //   })
  // }
  // async.parallel({
  //   itemResults1: callback => {
  //     const regex = new RegExp(escapeRegex(arrayValue[0]), 'gi')
  //     console.log('search: ', regex)
  //     Item.find({ $and: [{ 'metadata.value': regex }, { 'infos.value': regex }] }).exec(callback)
  //   },
  //   itemResults2: callback => {
  //     const regex = new RegExp(escapeRegex(arrayValue[1]), 'gi')
  //     console.log('search: ', regex)
  //     Item.find({ $and: [{ 'metadata.value': regex }, { 'infos.value': regex }] }).exec(callback)
  //   },
  //   itemResults3: callback => {
  //     const regex = new RegExp(escapeRegex(arrayValue[2]), 'gi')
  //     console.log('search: ', regex)
  //     Item.find({ $and: [{ 'metadata.value': regex }, { 'infos.value': regex }] }).exec(callback)
  //   }

  // }, (err, result) => {
  //   if (err) throw err
  //   var array1 = result.itemResults1, array2 = result.itemResults2, array3 = result.itemResults3, array4 = []
  //   console.log('array 1: ', array1.length)
  //   console.log('array 2: ', array2.length)
  //   console.log('array 3: ', array3.length)

  //   var array12 = []
  //   array1.map(item1 => {
  //     array2.map(item2 => {
  //       if (JSON.stringify(item1) === JSON.stringify(item2)) {
  //         array12.push(item2)
  //       }
  //     })
  //   })
  //   console.log('array 12: ', array12.length)

  //   array12.map(item12 => {
  //     array3.map(item3 => {
  //       if (JSON.stringify(item12) === JSON.stringify(item3)) {
  //         array4.push(item3)
  //       }
  //     })
  //   })
  //   console.log(array4)
  //   res.send({itemResults: array4})
  // })


  // const regex = new RegExp(escapeRegex(req.body.data), 'gi')


})

// delete many
router.delete('/items', (req, res)=>{
  Item.deleteMany({}, (err, result)=>{
    if(err) throw err
    res.send('Delete many successfully')
  })
})

// item status

// get all item status
router.get('/itemStatus', function (req, res, next) {
  ItemStatus.find({}, (err, results) => {
    if (err) throw err
    res.render('itemStatus', { dbItemObjs: results });

  })
});

// upload item statuses
router.post('/itemStatus', (req, res) => {
  var itemObjsArray = req.body
  itemObjsArray.forEach(item => {
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

// create new item status
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

// delete item status
router.delete('/itemStatus/:id', (req, res) => {
  console.log(req.params.id)
  ItemStatus.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) throw err
    if (result) {
      res.send({ message: "Delete item successfully", isDeleted: true })
    } else {
      res.send({ message: "Failed to delete item", isDeleted: false })
    }
  })
})

// update item status
router.put('/itemStatus/:id', (req, res) => {
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)


  ItemStatus.findByIdAndUpdate({ _id: req.params.id }, { $set: { "infos": req.body.infos } }, (err, result) => {
    if (err) throw err
    if (result) {
      res.send({ message: 'Update item successfully', isUpdated: true })

    } else {
      res.send({ message: 'Failed to update item', isUpdated: false })

    }
  })
})

// search item statuses
router.post('/itemStatus/search', (req, res) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')

    arrayMetadataConditions.push({ 'metadata.value': regex })
    arrayInfosConditions.push({ 'infos.value': regex })
  })
  console.log('array metadata condition: ', arrayMetadataConditions)
  console.log('array infos condition: ', arrayInfosConditions)
  ItemStatus.find({ $or: [{ $and: arrayMetadataConditions }, { $or: arrayInfosConditions }] }).exec((err, results) => {
    if (err) throw err
    res.send({ itemStatusResults: results })

  })
})

// evaluation
router.get('/evaluation', (req, res) => {
  Item.find({}, (err, itemResults) => {
    if (err) throw err
    ItemStatus.find({}, (err, itemStatusResults) => {
      res.render('evaluation', { itemResults: itemResults, itemStatusResults: itemStatusResults });

    })

  })
})

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
  }, (err, result) => {
    if (err) throw (err)
    res.send({ itemResults: result.itemResults, itemStatusResults: result.itemStatusResults })
  })

})

module.exports = router;
