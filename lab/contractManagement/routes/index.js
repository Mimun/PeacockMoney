var express = require('express');
var router = express.Router();
var Item = require('../models/item')

/* GET home page. */
router.get('/', function(req, res, next) {
  Item.find({}, (err, results) => {
    if (err) throw err
    res.render('createNewContract', { dbItemObjs: results });

  })
});

module.exports = router;
