var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var Employee = require('../models/employee')
var JobTitle = require('../models/jobTitle')
var Role = require('../models/role')
var Store = require('../models/store')
const accessTokenSecret = 'somerandomaccesstoken';
const refreshTokenSecret = 'somerandomstringforrefreshtoken';
const refreshTokens = [];
const auth = require('./checkAuthentication');
const mongoose = require('mongoose');
const async = require('async')

const rootRole = {
  name: "root",
  urls: {
    "/contractMng/waitingContracts": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/contractMng/pendingContracts": {
      "GET": true,
      "POST": false,
      "PUT": false,
      "DELETE": false
    },
    "/contractMng/latePeriod": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/contractMng/goingToDo": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/contractMng/contracts": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/evaluationMng/evaluation": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/contractMng/contractTemplates": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/properties": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/statistic": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/moneyReport": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/companyMoneyReport": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/statisticReport": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/checkTableSummaryReport": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/contractMng": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/stores": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/warehouses": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/itemStatus": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/employees": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/evaluationMng": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/itemType": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/receiptId": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/contractMng/transactionHistory": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    },
    "/systemMng/roles": {
      "GET": true,
      "POST": true,
      "PUT": true,
      "DELETE": true
    }
  },
  stores: ['all']
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
    value: "maNhân viêncapcao",
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
    value: "Nhân viêncapcao@email.com",
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
    dataVie: "Cửa hàng"
  }, {
    cType: "select",
    dataKor: "koreanString",
    name: "role",
    value: "root",
    dataVie: "phanQuyen"
  }],
  isCheckMember: true,
  isApproveMember: true

}


// LOGIN
router.get('/', function (req, res, next) {
  res.redirect('login')
});

// get login
router.get('/login', (req, res, next) => {
  async.parallel({
    employee: callback => {
      Employee.findOne({ $and: [{ 'metadata.value': 'root' }, { 'metadata.value': '123456' }] }).exec(callback)
    },
    role: callback => {
      Role.findOne({ name: 'root' }).exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    // handle no root account
    if (!results.employee) {
      console.log('no root account')
      try {
        new Employee(rootAcc).save()
      } catch (error) {
        console.error(error)
      }
    } else {
      if (results.employee.isCheckMember === undefined || results.employee.isApproveMember === undefined
        || results.employee.isCheckMember === null || results.employee.isApproveMember === null
        || results.employee.isCheckMember === false || results.employee.isApproveMember === false) {
        try {
          Employee.deleteOne({ $and: [{ 'metadata.value': 'root' }, { 'metadata.value': '123456' }] }).exec((err, result) => {
            if (err) throw err
            new Employee(rootAcc).save()

          })
        } catch (error) {
          console.error(error)
        }

      }
    }

    // handle no role root
    if (!results.role) {
      try {
        new Role(rootRole).save()
      } catch (error) {
        console.error(error)
      }
    } else {
      if (results.role.urls === undefined || results.role.urls === null
        || results.role.store === undefined || results.role.store === null) {
        try {
          Role.deleteOne({ name: 'root' }).exec((err, result) => {
            if (err) throw err
            new Role(rootRole).save()

          })
        } catch (error) {
          console.error(error)
        }

      }
    }
  })
  res.render('login', {})

})

// post login
const jwtSign = (name, role, id, store, isCheckMember, isApproveMember) => {
  const accessToken = jwt.sign({ userName: name, role, id, store, isCheckMember: isCheckMember, isApproveMember: isApproveMember }, accessTokenSecret, { expiresIn: '48h' })
  const refreshToken = jwt.sign({ userName: name, role, id, store, isCheckMember: isCheckMember, isApproveMember: isApproveMember }, refreshTokenSecret)
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
        console.log('result: ', result)
        var resultUserName = findNestedObj(result, 'name', 'name') ? findNestedObj(result, 'name', 'name').value : 'None'
        var resultRole = findNestedObj(result, 'name', 'role') ? findNestedObj(result, 'name', 'role').value : 'None'
        var employeeId = result._id
        var isCheckMember = result.isCheckMember
        var isApproveMember = result.isApproveMember
        var resultAvatar = findNestedObj(result, 'name', 'avatar') ? findNestedObj(result, 'name', 'avatar').value : 'None'
        var store = findNestedObj(result, 'name', 'store') ? findNestedObj(result, 'name', 'store').value : ''
        console.log("STORE FROM LOGIN: ", store)

        async.parallel({
          store: callback => {
            Store.findOne({ 'metadata.value': store }).exec(callback)
          },
          role: callback => {
            Role.findOne({ name: resultRole }).exec(callback)
          }
        }, (err, results) => {
          if (err) throw err
          var storeId = '', role = ''
          if (results.store && results.role) {
            storeId = findNestedObj(results.store.metadata, 'name', 'id') ? findNestedObj(results.store.metadata, 'name', 'id').value : ''
            role = results.role.name
            var { accessToken, refreshToken } = jwtSign(resultUserName, role, employeeId, [storeId], isCheckMember, isApproveMember)
            res.send({
              accessToken, refreshToken, user: {
                userName: resultUserName, role: role, _id: employeeId, storeId, isCheckMember, isApproveMember, avatar: resultAvatar
              }, isLoggedIn: false
            })
            return
          } else if (results.store && !results.role) {
            storeId = findNestedObj(results.store.metadata, 'name', 'id') ? findNestedObj(results.store.metadata, 'name', 'id').value : ''
            role = 'root'
          } else if (!results.store && results.role) {
            storeId = results.role.name === "root" ? ["all"] : []
            role = results.role.name
          } else {
            storeId = ["all"]
            role = 'root'

          }

          var { accessToken, refreshToken } = jwtSign(resultUserName, role, employeeId, storeId, isCheckMember, isApproveMember)
          res.send({
            accessToken, refreshToken, user: {
              userName: resultUserName, role: role, _id: employeeId, storeId, isCheckMember, isApproveMember, avatar: resultAvatar
            }, isLoggedIn: false
          })
        })

        // if (store) {
        //   Store.findOne({ 'metadata.value': store }).exec((err, store) => {
        //     if (err) throw err
        //     if(store){
        //       var storeId = findNestedObj(store.metadata, 'name', 'id')? findNestedObj(store.metadata, 'name', 'id').value: ''
        //       var { accessToken, refreshToken } = jwtSign(resultUserName, resultRole, employeeId, [storeId], isCheckMember, isApproveMember)
        //       res.send({
        //         accessToken, refreshToken, user: {
        //           userName: resultUserName, role: resultRole, _id: employeeId, storeId, isCheckMember, isApproveMember, avatar: resultAvatar
        //         }, isLoggedIn: false
        //       })
        //     } else {
        //       var { accessToken, refreshToken } = jwtSign(resultUserName, resultRole, employeeId, [], isCheckMember, isApproveMember)
        //       res.send({
        //         accessToken, refreshToken, user: {
        //           userName: resultUserName, role: resultRole, _id: employeeId, storeId, isCheckMember, isApproveMember, avatar: resultAvatar
        //         }, isLoggedIn: false
        //       })
        //     }

        //   })

        // } else {
        //   var store = resultRole==="root"? ["all"]: []
        //   var { accessToken, refreshToken } = jwtSign(resultUserName, resultRole, employeeId, store, isCheckMember, isApproveMember)
        //   res.send({
        //     accessToken, refreshToken, user: {
        //       userName: resultUserName, role: resultRole, _id: employeeId, store, isCheckMember, isApproveMember, avatar: resultAvatar
        //     }, isLoggedIn: false
        //   })
        // }

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
