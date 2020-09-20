var express = require('express');
var router = express.Router();
var Item = require('../models/item')
var ItemStatus = require('../models/itemStatus');
var async = require('async')
var auth = require('../../authentication/routes/checkAuthentication')

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// item
/* GET home page. */
router.get('/', auth.isAuthenticated, auth.checkRole, function (req, res, next) {
  async.parallel({
    count: callback => {
      Item.count().exec(callback)
    },
    itemList: callback => {
      Item.find({}).sort({ _id: 1 }).exec(callback)
    },
    testList: callback => {
      Item.find().sort({ _id: 1 }).exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    res.render('index', { itemList: results.itemList, totalItems: results.count, roleAbility: req.roleAbility, testList: results.testList });
  })

});
// router.get('/', auth.isAuthenticated, auth.checkRole, function (req, res, next) {
//   async.parallel({
//     count: callback => {
//       Item.count().exec(callback)
//     },
//     itemList: callback => {
//       Item.find({}).sort({ _id: 1 }).limit(5).exec(callback)
//     },
//     testList: callback => {
//       Item.find().sort({ _id: 1 }).exec(callback)
//     }
//   }, (err, results) => {
//     if (err) throw err
//     res.render('item', { itemList: results.itemList, totalItems: results.count, roleAbility: req.roleAbility, testList: results.testList });
//   })

// });

// upload items
router.post('/items', (req, res) => {
  var itemObjsArray = req.body
  itemObjsArray.map(itemObj => {
    Item.findOneAndUpdate({ _id: itemObj._id }, { $set: { "infos": itemObj.infos } }, (err, result) => {
      if (err) throw err
      if (result) {
        console.log('Updated successfully!')
      } else {
        var item = new Item({
          metadata: itemObj.metadata,
          infos: itemObj.infos
        })
        item.save((err, result) => {
          if (err) throw err
          console.log('Saved to db successfully!')

        })
      }

    })

  })

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

// get items of specific page in pagination
router.post('/items/page', (req, res, next) => {
  console.log('req(from pagination): ', req.body)
  let nextPage = req.body.nextPage
  let currentPage = req.body.currentPage
  let pageSize = req.body.pageSize

  if (nextPage > currentPage) {
    Item.find({ _id: { $gt: req.body.lastId } }).skip((nextPage - currentPage - 1) * pageSize).limit(5).exec((err, result) => {
      if (err) throw err
      res.status(200).send({ items: result })
    })
  } else if (nextPage < currentPage) {
    Item.find({ _id: { $lt: req.body.firstId } }).sort({ _id: -1 }).skip((currentPage - nextPage - 1) * pageSize).limit(5).exec((err, result) => {
      if (err) throw err
      res.status(200).send({ items: result.reverse() })
    })
  }
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

})




// delete many
router.delete('/items', (req, res) => {
  Item.deleteMany({}, (err, result) => {
    if (err) throw err
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

// delete many
router.delete('/itemstatus', (req, res) => {
  ItemStatus.deleteMany({}, (err, result) => {
    if (err) throw err
    res.send('Delete many successfully!')
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
  const arrayValue = req.body.data.split(" ")
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')

    arrayMetadataConditions.push({ 'metadata.value': regex })
    arrayInfosConditions.push({ 'infos.value': regex })
  })
  console.log('meta conditions: ', arrayMetadataConditions)
  console.log('info conditions: ', arrayInfosConditions)
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

module.exports = router;
