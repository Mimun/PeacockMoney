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
router.get('/itemStatus', function (req, res, next) {
  // Item.find({}, (err, results) => {
  //   if (err) throw err
  //   console.log('result: ', results)
  //   const newResult = results.map(result => {
  //     return {
  //       infos: result.infos,
  //       metadata: result.metadata
  //     }
  //   })
  //   res.render('index', { dbItemObjs: results });

  // })
  res.render('itemStatus', { dbItemObjs: [] })
});

router.post('/postItem', (req, res) => {
  var itemObjsArray = req.body
  var array = []
  itemObjsArray.map(itemObj => {
    if (itemObj._id) {
      console.log('abc: ', itemObj)
      Item.findOneAndUpdate({ _id: itemObj._id }, { $set: { "infos": itemObj.infos } }, (err, result) => {
        if (err) throw err
        console.log('Updated successfully!')
        array.push(itemObj)
      })

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
  console.log('array: ', array)

})  

module.exports = router;
