var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var Employee = require('../models/employee')
var JobTitle = require('../models/jobTitle')
var Role = require('../models/role')
const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';
const refreshTokens = [];
const auth = require('./checkAuthentication');
const mongoose = require('mongoose');
const async = require('async')
// const rootAcc = {
//   userName: 'root',
//   password: '123456',
//   avatar: '/images/userPicture.png',
//   role: 'root'
// }
const rootRole = {
  name: "root",
  abilities: {
    name: "root",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canSee: true
  },
}
const rootAcc = {
  metadata: [{
    cType: "image",
    dataKor: "koreanString",
    name: "avatar",
    value: "",
    dataVie: "anhDaiDien"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: 'name',
    value: "root",
    dataVie: "Họ tên"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: "id",
    value: "manhanviencapcao",
    dataVie: "Mã nhân viên"
  }, {
    cType: "date",
    dataKor: "koreanString",
    name: "dateOfBirth",
    value: "0220-12-31",
    dataVie: "Ngày sinh"
  }, {
    cType: "date",
    dataKor: "koreanString",
    name: "joiningDate",
    value: "2000-12-31",
    dataVie: "Ngày vào công ty"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: "address",
    value: "dia chi nhan vien cap cao",
    dataVie: "Địa chỉ"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: "idCard",
    value: "cmnd 2",
    dataVie: "CMND"
  }, {
    cType: "date",
    dataKor: "koreanString",
    name: "providingDate",
    value: "2020-12-31",
    dataVie: "Ngày cấp"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: "providingPlace",
    value: "noi cap 2",
    dataVie: "Nơi cấp"
  }, {
    cType: "number",
    dataKor: "koreanString",
    name: "phoneNumber",
    value: "0123123",
    dataVie: "Số điện thoại"
  }, {
    cType: "email",
    dataKor: "koreanString",
    name: "email",
    value: "nhanviencapcao@email.com",
    dataVie: "email"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: "note",
    value: "ghi chu 2",
    dataVie: "Ghi chú"
  }, {
    cType: "text",
    dataKor: "koreanString",
    name: "password",
    value: "123456",
    dataVie: "Mật khẩu"
  }, {
    cType: "select",
    dataKor: "koreanString",
    name: "store",
    value: "",
    dataVie: "cuaHang"
  }, {
    cType: "select",
    dataKor: "koreanString",
    name: "role",
    value: "specialJobTitle",
    dataVie: "phanQuyen"
  }],

}


// LOGIN
router.get('/', function (req, res, next) {
  res.redirect('login')
});

// get login
router.get('/login', (req, res, next) => {
  Employee.findOne({ $and: [{ 'metadata.value': 'root' }, { 'metadata.value': '123456' }] }, (err, result) => {
    if (err) throw err
    if (!result) {
      try {
        async.parallel({
          employee: callback => {
            new Employee(rootAcc).save(callback)
          },
          jobTitle: callback => {
            Role.findOne({ name: 'root' }).exec((err, result) => {
              if (err) throw err
              if (result) {
                new JobTitle({
                  name: 'specialJobTitle',
                  role: new mongoose.Types.ObjectId(result._id)
                }).save(callback)
              } else {
                new Role(rootRole).save((err, result) => {
                  if (err) throw err
                  new JobTitle({
                    name: 'specialJobTitle',
                    role: new mongoose.Types.ObjectId(result._id)
                  }).save(callback)
                })
              }
            })
          }
        }, (err, results) => {
          if (err) throw err

        })
      } catch (error) {
        console.error(error)
      }
    }
    res.render('login', {})

  })
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
        var resultUserName = findNestedObj(result, 'name', 'name') ? findNestedObj(result, 'name', 'name').value : 'None'
        var resultRole = findNestedObj(result, 'name', 'role') ? findNestedObj(result, 'name', 'role').value : 'None'
        var resultAvatar = findNestedObj(result, 'name', 'avatar') ? findNestedObj(result, 'name', 'avatar').value : 'None'
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

// home page
router.get('/home', auth.isAuthenticated, auth.checkRole, (req, res, next) => {
  res.render('index', { title: 'Happy Money' });

})

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
