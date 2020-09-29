var express = require('express');
var router = express.Router();
var Employee = require('../../../models/employee')
var Store = require('../../../models/store')
var Warehouse = require('../../../models/warehouse')
var Property = require('../../../models/property')
var Item = require('../../../models/item')
var async = require('async');
var atob = require('atob')
var btoa = require('btoa')
var fs = require('fs');
var auth = require('../../authentication/routes/checkAuthentication')

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.redirect('employees')
});

// EMPLOYEES
// get all employees
router.get('/employees', (req, res, next) => {
  async.parallel({
    stores: callback => {
      // try catch to prevent "store" field id is null
      try {
        Store.find({}).exec(callback)

      } catch (err) {
        console.error(err)
      }
    },
    employees: callback => {
      try {
        Employee.find({}).exec(callback)
      } catch (err) {
        console.error(err)
      }

    }
  }, async (err, results) => {
    if (err) throw err
    var storeList = []
    if (results.stores.length !== 0) {
      storeList = await results.stores.map(store => {
        var name = findNestedObj(store, 'name', 'name') ? findNestedObj(store, 'name', 'name').value : 'None'
        var address = findNestedObj(store, 'name', 'address') ? findNestedObj(store, 'name', 'address').value : 'None'
        var id = findNestedObj(store, 'name', 'id') ? findNestedObj(store, 'name', 'id').value : 'None'
        return {
          _id: store._id,
          name,
          address,
          id
        }
      })
    }

    res.render('employees', { employeeList: results.employees, storeList, roleAbility: req.roleAbility })
  })
})

// create new employee
router.post('/employees', (req, res, next) => {
  console.log('req.body: ', req.body)
  var avatar = findNestedObj(req.body, 'name', 'avatar').value
  let base64Ext = avatar.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/')[1]
  let base64data = avatar.replace(/^data:image\/[a-z]+;base64,/, "")
  var name = findNestedObj(req.body, 'name', 'name').value
  if (base64data) {
    fs.writeFile(`public/images/${name}.${base64Ext}`, base64data, 'base64', (err) => {
      if (err) console.error(err)
      findNestedObj(req.body, 'name', 'avatar').value = `/images/${name}.${base64Ext}`
      var employee = new Employee(req.body)
      console.log('employee: ', employee)
      try {
        employee.save((err, result) => {
          if (err) throw err
          if (result) {
            res.send('Saved successfully!')

          }
        })
      } catch (err) {
        console.error(err)
      }
    })
  } 
})

// upload multiple employees
router.post('/multEmployee', async (req, res)=>{
  console.log('req.body: ', req.body)
  await req.body.dbObjects.forEach(object=>{
    var employee = new Employee(object)
    employee.save((err, result)=>{
      if(err) throw err
    })
  })
  res.send('Upload successfully!')
})

// upate employee
router.put('/employees/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  var employeeAvatar = findNestedObj(req.body.metadata, 'name', 'avatar') ? findNestedObj(req.body.metadata, 'name', 'avatar').value : 'None'
  var name = findNestedObj(req.body, 'name', 'name') ? findNestedObj(req.body, 'name', 'name').value : 'Unknown'
  var base64data = employeeAvatar.replace(/^data:image\/[a-z]+;base64,/, "")
  if (base64data) {
    var isBase64 = checkBase64(base64data)
    if (isBase64) {
      let base64Ext = employeeAvatar.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/')[1]
      console.log('extension 1: ', base64Ext)
      // const imageBuffer = new Buffer(base64data, "base64");
      fs.writeFileSync(`public/images/${name}.${base64Ext}`, base64data, 'base64');
      findNestedObj(req.body.metadata, 'name', 'avatar').value = `/images/${name}.${base64Ext}`
    }
  }

  Employee.findByIdAndUpdate({ _id: req.params.id }, { $set: { 'metadata': req.body.metadata, 'store': req.body.store } }, (err, result) => {
    if (err) throw err
    res.send('Update successfully!')
  })
})

// delete employee
router.delete('/employees/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  Employee.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) throw err
    res.send('Delete successfully!')
  })
})

// search
router.post('/employees/search', (req, res, next) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')
    arrayMetadataConditions.push({ 'metadata.value': regex })
  })
  Employee.find({ $and: arrayMetadataConditions }).populate([
    {
      path: 'store',
      model: 'Store'
    }
  ]).exec((err, results) => {
    if (err) throw err
    res.status(200).send({ employeeList: results })
  })

})

// STORES
// get all stores
router.get('/stores', (req, res, next) => {
  async.parallel({
    stores: callback => {
      try {
        Store.find({}).populate([
          {
            path: 'representatives',
            model: Employee
          }
        ]).exec(callback)

      } catch (err) {
        console.error(err)
      }
    },
    employees: callback => {
      try {
        Employee.find({}).exec(callback)
      } catch (err) {
        console.error(err)
      }

    }
  }, (err, results) => {
    if (err) throw err
    var employeeList = []
    if (results.employees.length !== 0) {
      employeeList = results.employees.map(employee => {
        var name = findNestedObj(employee, 'name', 'name') ? findNestedObj(employee, 'name', 'name').value : 'None'
        var role = findNestedObj(employee, 'name', 'role') ? findNestedObj(employee, 'name', 'role').value : 'None'
        return {
          _id: employee._id,
          name,
          role
        }
      })
    }

    res.render('stores', { storeList: results.stores, employeeList })
  })

})

const createMetadata = (name = "", value = null, cType = "text", dataVie = "vietnameseString", dataKor = "koreanString") => {
  return {
    name, value, cType, dataVie, dataKor
  }
}

// create new store
router.post('/stores', (req, res, next) => {
  console.log('req.body: ', req.body)
  var store = new Store(req.body)
  try {
    store.save((err, result) => {
      if (err) throw err
      var warehouseMetadataArray = []
      result.metadata.forEach(data => {
        if (data.name === "name" || data.name === "id" || data.name === "address"
          || data.name === "phoneNumber" || data.name === "email" || data.name === "note") {
          warehouseMetadataArray.push(data)
        }
      })
      var warehouse = new Warehouse({
        metadata: warehouseMetadataArray,
        infos: [],
        representatives: result.representatives,
        store: result._id,
        deactive: false
      })
      try {
        warehouse.save((err, result) => {
          if (err) throw err
          res.status(200).send('Save store and warehouse sucessfully!')
        })
      } catch (error) {
        console.error(error)
      }
    })
  } catch (error) {
    console.error(error)
  }


})

// update store
router.put('/stores/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  async.parallel({
    store: callback => {
      Store.findByIdAndUpdate({ _id: req.params.id },
        { $set: { "metadata": req.body.metadata, "representatives": req.body.representatives } }).exec(callback)
    },
    warehouse: callback => {
      Warehouse.findByIdAndUpdate({ _id: req.params.id },
        { $set: { "metadata": req.body.metadata, "representatives": req.body.representatives } }).exec(callback)
    }
  }, (err, results) => {
    if (err) throw err
    res.status(200).send("Update store and warehouse successfully!")
  })

})

// delete store
router.delete('/stores/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  async.parallel({
    store: callback => {
      Store.findByIdAndDelete({ _id: req.params.id }).exec(callback)
    },
    warehouse: callback => {
      Warehouse.findByIdAndDelete({ _id: req.params.id }).exec(callback)

    }
  }, (err, results) => {
    if (err) throw err
    res.status(200).send("Delete store and warehouse successfully!")
  })

})

// search store
router.post('/stores/search', (req, res, next) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')
    arrayMetadataConditions.push({ 'metadata.value': regex })
  })
  Store.find({ $and: arrayMetadataConditions }).exec((err, results) => {
    if (err) throw err
    res.status(200).send({ storeList: results })
  })

})

// WAREHOUSE
// get all warehouses
router.get('/warehouses', (req, res, next) => {
  async.parallel({
    warehouses: callback => {
      try {
        Warehouse.find({}).populate([
          {
            path: 'store',
            model: 'Store'
          }, 
          {
            path: 'representatives',
            model: 'Employee'
          }
        ]).exec(callback)
      } catch (err) {
        console.error(err)
      }
    },
    employees: callback => {
      try {
        Employee.find({}).exec(callback)
      } catch (err) {
        console.error(err)
      }
    },
    stores: callback => {
      try {
        Store.find({}).exec(callback)
      } catch (err) {
        console.error(err)
      }
    }
  }, async (err, results) => {
    if (err) throw err
    var employeeList = []
    var storeList = []
    if (results.employees.length !== 0) {
      employeeList = await results.employees.map(employee => {
        var name = findNestedObj(employee, 'name', 'name') ? findNestedObj(employee, 'name', 'name').value : 'None'
        var role = findNestedObj(employee, 'name', 'role') ? findNestedObj(employee, 'name', 'role').value : 'None'
        return {
          _id: employee._id,
          name,
          role
        }
      })
    }
    if (results.stores.length !== 0) {
      storeList = await results.stores.map(store => {
        var name = findNestedObj(store, 'name', 'name') ? findNestedObj(store, 'name', 'name').value : 'None'
        var address = findNestedObj(store, 'name', 'address') ? findNestedObj(store, 'name', 'address').value : 'None'
        return {
          _id: store._id,
          name,
          address
        }
      })
    }

    res.render('warehouses', { warehouseList: results.warehouses, employeeList, storeList })
  })
})

// create new warehouse
router.post('/warehouses', (req, res, next) => {
  console.log('req.body: ', req.body)
  var warehouse = new Warehouse(req.body)
  warehouse.save((err, result) => {
    if (err) throw err
    res.send('Saved successfully!')
  })
})

// update warehouse
router.put('/warehouses/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  console.log('req body: ', req.body)
  Warehouse.findByIdAndUpdate({ _id: req.params.id },
    {
      $set: {
        "metadata": req.body.metadata, "representatives": req.body.representatives, store: req.body.store,
        deactive: req.body.deactive
      }
    }, (err, result) => {
      if (err) throw err
      res.status(200).send("Update successfully!")
    })
})

// delete warehouse
router.delete('/warehouses/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  Warehouse.findByIdAndDelete({ _id: req.params.id }, (err, result) => {
    if (err) throw err
    res.status(200).send("Delete successfully!")
  })
})

// search warehouse
router.post('/warehouses/search', (req, res, next) => {
  console.log('req.body: ', req.body)
  const arrayValue = req.body.data
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  arrayValue.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')
    arrayMetadataConditions.push({ 'metadata.value': regex })
  })
  Warehouse.find({ $and: arrayMetadataConditions }).exec((err, results) => {
    if (err) throw err
    res.status(200).send({ warehouseList: results })
  })

})

// get property list of a warehouse
router.get('/warehouses/:id/properties', (req, res, next) => {
  console.log('id: ', req.params.id)
  async.parallel({
    propertyList: callback => {
      try {
        Property.find({ currentWarehouse: req.params.id }).populate([
          {
            path: 'evaluationItem',
            model: 'Item'
          },
          {
            path: 'currentWarehouse',
            model: 'Warehouse'
          },
          {
            path: 'contract', 
            model: 'Contract'
          }
        ]).exec(callback)
      } catch (error) {
        console.error(error)
      }

    },
    warehouseList: callback => {
      try {
        Warehouse.find({}).exec(callback)

      } catch (error) {
        console.error(error)
      }
    },
    warehouse: callback => {
      try {
        Warehouse.findOne({ _id: req.params.id }).exec(callback)
      } catch (error) {
        console.log(error)
      }
    }
  }, (err, result) => {
    if (err) throw err
    var warehouseList = []
    if (result.warehouseList.length !== 0) {
      warehouseList = result.warehouseList.map(warehouse => {
        return {
          _id: warehouse._id,
          name: findNestedObj(warehouse, 'name', 'name') ? findNestedObj(warehouse, 'name', 'name').value : 'None',
          address: findNestedObj(warehouse, 'name', 'address') ? findNestedObj(warehouse, 'name', 'address').value : 'None'
        }
      })
    }

    res.render('properties', { propertyList: result.propertyList, warehouseList, pageTitle: findNestedObj(result.warehouse, 'name', 'name').value })
  })

})

// PROPERTIES
// get all properties 
router.get('/properties', (req, res, next) => {
  async.parallel({
    propertyList: callback => {
      try {
        Property.find({}).populate([
          {
            path: 'evaluationItem',
            model: 'Item'
          },
          {
            path: 'currentWarehouse',
            model: 'Warehouse'
          },
          {
            path: 'contract', 
            model: 'Contract'
          }
        ]).exec(callback)
      } catch (error) {
        console.log(error)
      }
    },
    warehouseList: callback => {
      try {
        Warehouse.find({ deactive: false }).exec(callback)
      } catch (error) {
        console.log(error)
      }
    }
  }, (err, result) => {
    if (err) throw err
    var warehouseList = []
    if (result.warehouseList.length !== 0) {
      result.warehouseList.map(warehouse => {
        warehouseList.push({
          _id: warehouse._id,
          name: findNestedObj(warehouse, 'name', 'name') ? findNestedObj(warehouse, 'name', 'name').value : 'None',
          address: findNestedObj(warehouse, 'name', 'address') ? findNestedObj(warehouse, 'name', 'address').value : 'None'
        })
      })
    }

    res.render('properties', { propertyList: result.propertyList, warehouseList, pageTitle: '' })
  })

})

// update property
router.put('/properties/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)
  Property.findOneAndUpdate({ _id: req.params.id }, { $set: { currentWarehouse: req.body.currentWarehouse, movement: req.body.movement } }, { new: true }, (err, result) => {
    if (err) throw err
    res.send({ message: 'Updated successfully!', result })
  })
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

const checkBase64 = (str) => {
  if (str === '' || str.trim() === '') { return false; }
  try {
    console.log('test result from checkBase64 1: ', btoa(atob(str)) == str)
    return btoa(atob(str)) == str;
  } catch (err) {
    console.log('test result from checkBase64 2: ', false)

    return false;
  }
}

module.exports = router;
