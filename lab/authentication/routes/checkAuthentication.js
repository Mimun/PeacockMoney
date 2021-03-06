var jwt = require('jsonwebtoken')
const accessTokenSecret = 'somerandomaccesstoken';
const fs = require('fs')
const authenticate = require('./authenticate')

exports.isAuthenticated = function (req, res, next) {
  console.log('headers: ', req.headers)
  console.log('url: ', req.url)

  if (req.headers &&
    req.headers["x-access-token"] &&
    req.headers["x-access-token"].split(' ')[0] === 'Bearer') {
    var jwtToken = req.headers["x-access-token"].split(' ')[1];
    if (jwtToken) {
      jwt.verify(jwtToken, accessTokenSecret, function (err, payload) {
        if (err) {
          res.status(401).json({ message: 'Unauthorized user!' });
        } else {
          console.log('decoder: ', payload);
          next()
        }
      });
    } else {
      res.status(401).json({ message: 'Unauthorized user!' });

    }

  } else if(req.url.split('?token=')[1]) {
    var jwtToken = req.url.split('?token=')[1];
    if (jwtToken) {
      jwt.verify(jwtToken, accessTokenSecret, function (err, payload) {
        if (err) {
          res.status(401).json({ message: 'Unauthorized user!' });
        } else {
          req.payload = payload
          next()
        }
      });
    } else {
      res.status(401).json({ message: 'Unauthorized user!' });

    }
  } else {
    res.status(401).json({ message: 'Unauthorized user!' });

  }
};

exports.checkRole = function (req, res, next) {
  req.roleAbility = authenticate.authenticate[req.payload.role]
  next()
  // fs.readFile('./routes/authenticate.json', (err, data)=>{
  //   if(err) throw err
  //   console.log('data: ', data)
  // })  
} 