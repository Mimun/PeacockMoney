var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var User = require('../models/user')
var Employee = require('../../systemManagement/models/employee')
const checkAuthentication = require('./checkAuthentication')
const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';
const refreshTokens = [];

const rootAcc = {
  userName: 'abcdef',
  password: '12345ghi',
  role: 'root'
}

/* GET home page. */
// LOGIN
router.get('/', function (req, res, next) {
  // res.render('index', {title: 'HP'})
  res.redirect('login')
});

// get login
router.get('/login', (req, res, next) => {
  res.render('login', {})
})

// post login
const jwtSign = (name, role) => {
  const accessToken = jwt.sign({ userName: name, role }, accessTokenSecret, { expiresIn: '24h' })
  const refreshToken = jwt.sign({ userName: name, role }, refreshTokenSecret)
  refreshTokens.push(refreshToken)
  return {
    accessToken, refreshToken
  }
}

router.post('/login', (req, res, next) => {
  console.log('req.body: ', req.body)
  const { userName, password } = req.body.userAccount

  // check if already logged in
  if (req.body.localStorage) {
    res.send({
      accessToken: null, refreshToken: null, user: {}, isLoggedIn: true
    })

  } else {
    Employee.findOne({ $and: [{ 'metadata.value': userName }, { 'metadata.value': password }] }, (err, result) => {
      if (err) throw err
      if (result) {
        var resultUserName = findNestedObj(result, 'name', 'fullName').value
        var resultRole = findNestedObj(result, 'name', 'role').value
        var resultAvatar = findNestedObj(result, 'name', 'avatar').value
        var { accessToken, refreshToken } = jwtSign(resultUserName, resultRole)
        res.send({
          accessToken, refreshToken, user: {
            userName: resultUserName, role: resultRole, _id: result._id, avatar: resultAvatar
          }, isLoggedIn: false
        })
      } else {
        if (userName === rootAcc.userName && password === rootAcc.password) {
          var { accessToken, refreshToken } = jwtSign(rootAcc.userName, rootAcc.role)
          res.send({
            accessToken, refreshToken, user: rootAcc, isLoggedIn: false
          })
        } else {
          res.status(401).json({ message: 'Unauthorized user!' });
        }
      }
    })
  }

})

// register
router.get('/register', (req, res, next) => {
  res.render('register')
})

// post register
router.post('/register', (req, res, next) => {
  console.log('req.body: ', req.body)
})

// logout
// router.get('/logout', (req, res, next)=>{
//   window.localStorage.removeItem('accessToken')
//   window.localStorage.removeItem('user')
//   res.redirect('/')
// })

const findNestedObj = (entireObj, keyToFind, valToFind) => {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
}

module.exports = router;
