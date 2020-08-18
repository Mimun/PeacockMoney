var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/uploadImg', (req, res, next)=>{
  console.log('here',Object.keys(req.body), req.body.imgs);
  res.sendStatus(200)
})
module.exports = router;
