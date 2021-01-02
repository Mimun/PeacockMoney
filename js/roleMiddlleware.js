const Role = require('../models/role')
const JobTitle = require('../models/jobTitle')
const Store = require('../models/store')
const atob = require('atob');
const { result } = require('lodash');
const store = require('../models/store');

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function checkRoleAbilities(roleAbilities, abilitiesCanDo) {
  console.log('role abilities: ', roleAbilities, ', abilities can do: ', abilitiesCanDo, ', is equal: ')

  var canDo = false
  for (var prop in abilitiesCanDo) {

    if (roleAbilities[prop] === abilitiesCanDo[prop]) {
      canDo = true

    } else {
      canDo = false
    }

  }
  return canDo
}

// roleCanDo(array): require specific role to execute the action
// abilitiesCando(object): require specific abilitites to execute the action
// must have 2 conditions to enter the route
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
    console.log('decoded jwt: ', decodedJwt)

    Role.findOne({ name: decodedJwt.role }).exec((err, result) => {
      if (err) throw err
      if (result) {

        var reqUrlAbilitiesObj = result.urls[url]
        if (reqUrlAbilitiesObj[type]) {
          if (req.checkStores) {
            var storeQueries = result.stores.map(store => {
              if (store === 'only') {
                return decodedJwt.store? { _id: decodedJwt.store } : {}
              } else if (store === 'all') {
                return {}
              } else {
                return { _id: store }
              }
            })
            console.log('store queries: ', storeQueries)
            Store.find({ $or: storeQueries }).exec((err, result) => {
              if (err) throw err
              req.stores = result.map(store=>{
                return JSON.stringify(store._id)
              })
              next()

            })

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