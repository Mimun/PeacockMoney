const Role = require('../models/role')
const JobTitle = require('../models/jobTitle')
const Store = require('../models/store')
const Employee = require('../models/employee')
const atob = require('atob');
const { result } = require('lodash');
const store = require('../models/store');

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  console.log('decoded jwt: ', JSON.parse(jsonPayload))

  return JSON.parse(jsonPayload);
};

const findNestedObj = (entireObj, keyToFind, valToFind)=>{
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
}

module.exports = (req, res, next) => {
  var url = req.url, type = req.type
  console.log('url: ', url, ', type: ', type)

  try {
    var jwtToken = ''
    if (req.headers &&
      req.headers["x-access-token"] &&
      req.headers["x-access-token"].split(' ')[0] === 'Bearer') {
      jwtToken = req.headers["x-access-token"].split(' ')[1];

    } else if (req.query.token) {
      jwtToken = req.query.token;

    } else {
      // res.status(401).json({ message: 'Unauthorized user!' });
      res.redirect('/login')
    }
    var decodedJwt = parseJwt(jwtToken)
    console.log('DECODED JWT: ', decodedJwt)

    Role.findOne({ name: decodedJwt.role }).exec((err, result) => {
      if (err) throw err
      if (result) {

        var reqUrlAbilitiesObj = result.urls[url]
        if (reqUrlAbilitiesObj[type]) {
          if (req.checkStores) {
            var storeQueries = result.stores.map(store => {
              if (store === 'only') {
                return decodedJwt.store ? { 'metadata.value': decodedJwt.store } : {}
              } else if (store === 'all' || store === '') {
                return {}
              } else {
                return { 'metadata.value': store }
              }
            })
            console.log('STOREQUERIES: ', storeQueries)

            Store.find({ $or: storeQueries }).exec((err, result) => {
              if (err) throw err
              console.log("RESULT: ", result)
              req.stores = result.map(store => {
                return findNestedObj(store.metadata, 'name', 'id') ? findNestedObj(store.metadata, 'name', 'id').value : ''
              })
              next()

            })

          } else if (req.checkMember) {
            req.isCheckMember = decodedJwt.isCheckMember
            req.isApproveMember = decodedJwt.isApproveMember
            next()

          } else {
            next()
          }
        } else {
          res.send('Your role cannot execute the action!')
        }
      } else {
        res.send('You need to have a role to execute the action!')
      }

    })
  } catch (error) {
    console.error(error)
    res.redirect('/login')
  }

}