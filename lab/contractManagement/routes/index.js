var express = require('express');
var router = express.Router();
var Item = require('../models/item')

/* GET home page. */
router.get('/', function(req, res, next){
  res.render('index', {})
})

// router.get('/createNewContract', (req, res, next)=>{
//   console.log('here')
//   Item.find({}, (err, results) => {
//     if (err) throw err
//     res.render('createNewContract', { dbItemObjs: results});

//   })

// })

router.post('/createNewContract', function(req, res, next) {
  Item.find({}, (err, results) => {
    if (err) throw err
    res.render('createNewContract', { dbItemObjs: results, itemObj: JSON.parse(req.body.data)});

  })
 
});



module.exports = router;
