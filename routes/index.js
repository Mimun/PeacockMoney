var express = require('express');
const { route } = require('./users');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Happy Money' });
  res.redirect('auth')
});

router.get('/home', (req, res, next)=> {
  res.render('index', { title: 'Happy Money' });
})

module.exports = router;
