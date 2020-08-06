var express = require('express');
var router = express.Router();
var Item = require('../models/item')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/postItem', (req, res)=>{
  var itemObjsArray = req.body
  itemObjsArray.map(itemObj=>{
    
    var item = new Item({
      metadata: itemObj.metadata,
      infos: itemObj.infos
    })

    item.save((err, result)=>{
      if(err) throw err
      console.log('result: ', result)
    })

  })
})

module.exports = router;
