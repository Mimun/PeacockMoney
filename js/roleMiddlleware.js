const Role = require('../models/role')
const JobTitle = require('../models/jobTitle')
const atob = require('atob');
const role = require('../models/role');

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function checkRoleAbilities(roleAbilities, abilitiesCanDo) {
  console.log('role abilities: ', roleAbilities, ', abilities can do: ',abilitiesCanDo, ', is equal: ')

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
  var roleCanDo = req.roleCanDo, abilitiesCanDo = req.abilitiesCanDo
  // console.log('role can do: ', roleCanDo, ', abilities can do: ', abilitiesCanDo)

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
    JobTitle.findOne({ name: decodedJwt.role }).populate('role').exec(async (err, result) => {
      console.log('job title: ', result)
      if (err) {
        res.send('You cannot execute the action1!')
      } else {
        var roleName = result.role.name
        var roleAbilities = result.role.abilities
        var canDo = await checkRoleAbilities(roleAbilities, abilitiesCanDo)
        // console.log('role can do2: ', roleName, ', abilities can do2: ', roleAbilities, ', can enter: ', canDo)
        console.log('can do: ', canDo, ', is included: ', roleCanDo.includes(roleName))
        if (roleCanDo.includes(roleName) && canDo) {
          next()
        } else {
          res.send('You cannot execute the action2!')

        }

      }

    })
    // next()
  } catch (error) {
    console.error(error)
    res.redirect('/login')
  }

}