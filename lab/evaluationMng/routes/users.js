var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/test', (req, res)=>{
  res.send('status: ok')
})
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



module.exports = router;
