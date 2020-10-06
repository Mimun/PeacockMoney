var express = require('express');
var router = express.Router();
var Employee = require('../../../models/employee')
var Store = require('../../../models/store')
var Warehouse = require('../../../models/warehouse')
var Property = require('../../../models/property')
var Item = require('../../../models/item')
var ItemType = require('../../../models/itemType')
var async = require('async');
var atob = require('atob')
var btoa = require('btoa')
var fs = require('fs');
var _ = require('lodash');
const { find } = require('../../../models/employee');
var json2csv = require('json2csv').parse
var mongoose = require('mongoose')


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
router.post('/multEmployee', async (req, res) => {
  console.log('req.body: ', req.body)
  await req.body.dbObjects.forEach(object => {
    var employee = new Employee(object)
    employee.save((err, result) => {
      if (err) throw err
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

  // create warehouse
  var warehouseBasedOnStore = { ...req.body, metadata: [], store: store._id }
  req.body.metadata.forEach(data => {
    if (data.name === "name" || data.name === "id" || data.name === "address"
      || data.name === "phoneNumber" || data.name === "email" || data.name === "note") {
      warehouseBasedOnStore.metadata.push(data)
    }
  })
  findNestedObj(warehouseBasedOnStore.metadata, 'name', 'name').dataVie = 'tenKho'
  findNestedObj(warehouseBasedOnStore, 'name', 'id').dataVie = 'maKho'
  var warehouse = new Warehouse(warehouseBasedOnStore)
  console.log('warehouse based on store: ', warehouse)
  try {
    async.parallel({
      store: callback => {
        store.save(callback)
      },
      warehouse: callback => {
        warehouse.save(callback)
      }
    }, (err, results) => {
      if (err) throw err
      res.status(200).send('Save store and warehouse sucessfully!')
    })
  } catch (err) {
    console.error(err)
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
        Property.find({'currentWarehouse._id': mongoose.Types.ObjectId(req.params.id)}).exec(callback)
      } catch (error) {
        console.log(error)
      }
    },
    warehouseList: callback => {
      try {
        Warehouse.find({ deactive: false }).populate([
          {
            path: 'store',
            model: 'Store'
          }
        ]).exec(callback)
      } catch (error) {
        console.log(error)
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
      result.warehouseList.map(warehouse => {
        console.log('warehouse name: ', findNestedObj(warehouse.metadata, 'name', 'name'))
        warehouseList.push({
          _id: warehouse._id,
          warehouseName: findNestedObj(warehouse.metadata, 'name', 'name') ? findNestedObj(warehouse.metadata, 'name', 'name').value : 'None',
          warehouseAddress: findNestedObj(warehouse.metadata, 'name', 'address') ? findNestedObj(warehouse.metadata, 'name', 'address').value : 'None',
          warehouseId: findNestedObj(warehouse.metadata, 'name', 'id') ? findNestedObj(warehouse.metadata, 'name', 'id').value : 'None',
          storeId: findNestedObj(warehouse.store, 'name', 'id') ? findNestedObj(warehouse.store, 'name', 'id').value : 'None'
        })
      })
    }

    var propertyList = []
    if (result.propertyList.length !== 0) {
      result.propertyList.map(itemObj => {
        propertyList.push({
          _id: itemObj._id,
          currentWarehouse: itemObj.currentWarehouse,
          warehouseId: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'id')) : 'None',
          warehouseName: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'name')) : 'None',
          contractId: itemObj.contract ? itemObj.contract.id : 'None',
          itemTypeId: findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId') ? findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId').value : 'None',
          propertyId: itemObj.id,
          propertyName: itemObj.infos[0] ? (itemObj.infos[0].value !== '' ? itemObj.infos[0].value : 'None') : 'None',
          movement: itemObj.movement
        })
      })
    }

    res.render('properties', { propertyList, originPropertyList: result.propertyList, warehouseList, pageTitle: findNestedObj(result.warehouse, 'name', 'name').value })
  })

})

// PROPERTIES
// get all properties 
router.get('/properties', (req, res, next) => {
  async.parallel({
    propertyList: callback => {
      try {
        Property.find({}).exec(callback)
      } catch (error) {
        console.log(error)
      }
    },
    warehouseList: callback => {
      try {
        Warehouse.find({ deactive: false }).populate([
          {
            path: 'store',
            model: 'Store'
          }
        ]).exec(callback)
      } catch (error) {
        console.log(error)
      }
    }
  }, (err, result) => {
    if (err) throw err
    var warehouseList = []
    if (result.warehouseList.length !== 0) {
      result.warehouseList.map(warehouse => {
        console.log('warehouse name: ', findNestedObj(warehouse.metadata, 'name', 'name'))
        warehouseList.push({
          _id: warehouse._id,
          warehouseName: findNestedObj(warehouse.metadata, 'name', 'name') ? findNestedObj(warehouse.metadata, 'name', 'name').value : 'None',
          warehouseAddress: findNestedObj(warehouse.metadata, 'name', 'address') ? findNestedObj(warehouse.metadata, 'name', 'address').value : 'None',
          warehouseId: findNestedObj(warehouse.metadata, 'name', 'id') ? findNestedObj(warehouse.metadata, 'name', 'id').value : 'None',
          storeId: findNestedObj(warehouse.store, 'name', 'id') ? findNestedObj(warehouse.store, 'name', 'id').value : 'None'
        })
      })
    }

    var propertyList = []
    if (result.propertyList.length !== 0) {
      result.propertyList.map(itemObj => {
        propertyList.push({
          _id: itemObj._id,
          currentWarehouse: itemObj.currentWarehouse,
          warehouseId: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'id')) : 'None',
          warehouseName: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'name')) : 'None',
          contractId: itemObj.contract ? itemObj.contract.id : 'None',
          itemTypeId: findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId') ? findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId').value : 'None',
          propertyId: itemObj.id,
          propertyName: itemObj.infos[0] ? (itemObj.infos[0].value !== '' ? itemObj.infos[0].value : 'None') : 'None',
          movement: itemObj.movement
        })
      })
    }

    res.render('properties', { propertyList, originPropertyList: result.propertyList, warehouseList, pageTitle: '' })
  })

})

// update property
router.put('/properties/:id', (req, res, next) => {
  console.log('id: ', req.params.id)
  console.log('body: ', req.body)
  var updateObj = req.body
  Warehouse.findOne({ _id: updateObj.currentWarehouse }).exec((err, result) => {
    if (err) throw err
    updateObj.currentWarehouse = result
    console.log('updateObj: ', updateObj)
    Property.findOneAndUpdate({ _id: req.params.id },
      { $set: updateObj }, { new: true }, (err, result) => {
        if (err) throw err
        res.send({ message: 'Updated successfully!', result })
      })
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


// STATISTIC
// get statistic page
router.get('/statistic', (req, res) => {
  Warehouse.find({ deactive: false }).exec((err, result) => {
    if (err) throw err
    var warehouseList = result.map(res => {
      return {
        _id: res._id,
        id: res.id,
        name: findNestedObj(res, 'name', 'name') ? findNestedObj(res, 'name', 'name').value : 'None',
        address: findNestedObj(res, 'name', 'address') ? findNestedObj(res, 'name', 'address').value : 'None',

      }
    })
    res.render('statistics', { warehouseList })

  })
})

// get statistic/report for imported properties
router.post('/statistic/import', (req, res) => {
  console.log('req body: ', req.body)
  var chosenWarehouse = req.body.warehouses
  var dateConditions = req.body.dateConditions
  Property.find({}).sort({ _id: -1 }).exec((err, result) => {
    if (err) throw err
    callback(result, dateConditions, res)
  })

})

// get statistic/report for exported properties
router.post('/statistic/export', (req, res) => {
  console.log('req body: ', req.body)
  var chosenWarehouse = req.body.warehouses
  var dateConditions = req.body.dateConditions
  Property.find({}).sort({ _id: -1 }).exec((err, result) => {
    if (err) throw err
    callback2(result, dateConditions, res)
  })
})

// search report
router.post('/statistic/search', (req, res) => {
  console.log('req : ', req.body)
  var dateConditions = req.body.dateConditions
  var {
    arrayMetadataConditions,
    arrayInfosConditions,
    arrayCurrentWarehouseConditions,
    arrayOriginWarehouseConditions,
    arrayContractIdConditions,
    arrayPropertyIdConditions,
    arrayItemTypeIdConditions,
    arrayItemTypeConditions,
    arrayImportDateConditions,
    arrayExportDateConditions,
  } = createSearchArrayForReport(req.body.searchArray)
  console.log('reg exp: ', arrayMetadataConditions, arrayInfosConditions)
  Property.find({
    $or: [
      { $and: arrayMetadataConditions },
      { $and: arrayInfosConditions },
      { $and: arrayCurrentWarehouseConditions },
      { $and: arrayOriginWarehouseConditions },
      { $and: arrayContractIdConditions },
      { $and: arrayPropertyIdConditions },
      { $and: arrayItemTypeConditions },
      { $and: arrayItemTypeIdConditions },
      
    ]
  }).sort({_id: -1}).exec((err, result) => {
    if (err) throw err
    req.body.type === 'import' ? callback(result, dateConditions, res)
      : callback2(result, dateConditions, res)
  })
})

const callback = (result, dateConditions, res) => {
  console.log('date conditions: ', dateConditions)
  var array = []
  // property list
  result.forEach(res => {
    res.movement.forEach(movement => {
      var importDate = formatDate(movement.importDate)
      if (dateConditions.from && dateConditions.to) {
        var fromDate = formatDate(dateConditions.from)
        var toDate = formatDate(dateConditions.to)
        if (fromDate <= importDate && importDate <= toDate) {
          array.push({
            importDate: formatDate(movement.importDate),
            importNote: movement.importNote,
            storeId: movement.storeId,
            warehouseId: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'id')) : 'Out store',
            warehouseName: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'name')) : 'Out store',
            warehouseFrom: movement.warehouseFrom !== '' ? movement.warehouseFrom : 'None',
            warehouseTo: movement.warehouseTo !== '' ? movement.warehouseTo : 'None',
            contractId: res.contract ? res.contract.id : 'None',
            propertyId: res.id,
            propertyName: res.infos ? res.infos[0].value : 'None',
            customerId: 'None',
            customerName: 'None',
            itemTypeId: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemTypeId')),
            itemType: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemType')),
            contract_Id: res.contract._id
          })
          // return res
        }
      } else {
        var compareDate = formatDate(Date.now())
        if (importDate === compareDate) {
          array.push({
            importDate: formatDate(movement.importDate),
            importNote: movement.importNote,
            storeId: movement.storeId,
            warehouseId: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'id')) : 'Out store',
            warehouseName: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'name')) : 'Out store',
            warehouseFrom: movement.warehouseFrom,
            warehouseTo: movement.warehouseTo,
            contractId: res.contract ? res.contract.id : 'None',
            propertyId: res.id,
            propertyName: res.infos ? res.infos[0].value : 'None',
            customerId: 'None',
            customerName: 'None',
            itemTypeId: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemTypeId')),
            itemType: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemType')),
            contract_Id: res.contract._id

          })
          // return res
        }
      }
    })
  })
  const fields = ["storeId", "warehouseId", "warehouseName", "importDate", "contractId", "propertyId", "propertyName",
    "customerId", "customerName", "itemTypeId", "itemType", "warehouseFrom", "importNote"]
  let csv = json2csv(array, { fields })
  res.status(200).send({ result: array, originResult: result, csv, reportType: 'import' })
}

const callback2 = (result, dateConditions, res) => {
  console.log('date conditions: ', dateConditions)
  var array = []
  // property list
  result.forEach(res => {
    res.movement.forEach(movement => {
      var exportDate = formatDate(movement.exportDate)
      if (dateConditions.from && dateConditions.to) {
        var fromDate = formatDate(dateConditions.from)
        var toDate = formatDate(dateConditions.to)
        if (fromDate <= exportDate && exportDate <= toDate) {
          array.push({
            exportDate: formatDate(movement.exportDate),
            exportNote: movement.exportNote,
            storeId: movement.storeId,
            warehouseId: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'id')) : 'Out store',
            warehouseName: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'name')) : 'Out store',
            warehouseFrom: movement.warehouseFrom !== '' ? movement.warehouseFrom : 'None',
            warehouseTo: movement.warehouseTo !== '' ? movement.warehouseTo : 'None',
            contractId: res.contract ? res.contract.id : 'None',
            propertyId: res.id,
            propertyName: res.infos ? res.infos[0].value : 'None',
            customerId: 'None',
            customerName: 'None',
            itemTypeId: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemTypeId')),
            itemType: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemType')),
            contract_Id: res.contract._id

          })
          // return res
        }
      } else {
        var compareDate = formatDate(Date.now())
        if (exportDate === compareDate) {
          array.push({
            exportDate: formatDate(movement.exportDate),
            exportNote: movement.exportNote,
            storeId: movement.storeId,
            warehouseId: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'id')) : 'Out store',
            warehouseName: res.currentWarehouse ? getNestedValue(findNestedObj(res.currentWarehouse.metadata, 'name', 'name')) : 'Out store',
            warehouseFrom: movement.warehouseFrom !== '' ? movement.warehouseFrom : 'None',
            warehouseTo: movement.warehouseTo !== '' ? movement.warehouseTo : 'None',
            contractId: res.contract ? res.contract.id : 'None',
            propertyId: res.id,
            propertyName: res.infos ? res.infos[0].value : 'None',
            customerId: 'None',
            customerName: 'None',
            itemTypeId: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemTypeId')),
            itemType: getNestedValue(findNestedObj(res.contract.templateMetadata, 'name', 'itemType')),
            contract_Id: res.contract._id

          })
          // return res
        }
      }
    })

  })
  const fields = ["storeId", "warehouseId", "warehouseName", "exportDate", "contractId", "propertyId", "propertyName",
    "customerId", "customerName", "itemTypeId", "itemType", "warehouseTo", "exportNote"]
  let csv = json2csv(array, { fields })
  res.status(200).send({ result: array, originResult: result, csv, reportType: 'export' })
}

// ITEM TYPE
// get item type
router.get('/itemType', (req, res) => {
  ItemType.find().exec((err, result) => {
    if (err) throw err
    res.render('itemTypes', { itemTypeList: result })
  })
})

// create new item type
router.post('/itemType', (req, res) => {
  console.log('req body: ', req.body)
  var itemType = new ItemType(req.body)
  itemType.save((err, result) => {
    if (err) throw err
    res.send('Save item type successfully!')
  })
})


const formatDate = (date) => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

const getNestedValue = (obj) => {
  var value = obj ? (obj.value !== '' ? obj.value : 'None') : 'None'
  return value
}

const flatJson = (results, reportType) => {

  if (results.length !== 0) {
    var flatArray = results.map(result => {
      var importDate = result.importDate,
        importNote = result.importNote,
        storeId = result.storeId,
        warehouseId = result.warehouseId,
        warehouseName = result.warehouseName,
        warehouseFrom = result.warehouseFrom,
        warehouseTo = result.warehouseTo,
        contractId = result.contractId,
        propertyId = result.propertyId,
        propertyName = result.propertyName,
        customerId = result.customerId,
        customerName = result.customerName,
        itemTypeId = result.itemTypeId,
        itemType = result.itemType
      if (reportType === 'import') {
        return {
          storeId, warehouseId, warehouseName, importDate, contractid, propertyId, propertyName,
          customerId, customerName, itemTypeId, itemTypeName, warehouseFrom, importNote
        }
      } else {
        return { storeId, warehouseId, warehouseName, exportDate, contractId, propertyId, propertyName }
      }
    })
    return flatArray
  }
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// create regexp for search
const createRegexp = (array) => {
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  array.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')
    arrayMetadataConditions.push({ 'metadata.value': regex })
    arrayInfosConditions.push({ 'metadata.value': regex })
  })

  return { arrayMetadataConditions, arrayInfosConditions }
}

// create search array for report
const createSearchArrayForReport = (array) => {
  var searchArray = []
  // search for metadata, infos, current warehouse
  var arrayMetadataConditions = []
  var arrayInfosConditions = []
  var arrayCurrentWarehouseConditions = []
  var arrayOriginWarehouseConditions = []
  var arrayContractIdConditions = []
  var arrayPropertyIdConditions = []
  var arrayItemTypeIdConditions = []
  var arrayItemTypeConditions = []
  var arrayImportDateConditions = []
  var arrayExportDateConditions = []

  array.forEach(value => {
    const regex = new RegExp(escapeRegex(value), 'gi')
    arrayMetadataConditions.push({ 'metadata.value': regex })
    arrayInfosConditions.push({ 'infos.value': regex })
    arrayCurrentWarehouseConditions.push({ 'currentWarehouse.metadata.value': regex })
    arrayOriginWarehouseConditions.push({ 'originWarehouse.metadata.value': regex })
    arrayContractIdConditions.push({ 'id': regex })
    arrayPropertyIdConditions.push({ 'id': regex })
    arrayItemTypeIdConditions.push({ 'contract.templateMetadata.value': regex })
    arrayItemTypeConditions.push({ 'contract.templateMetadata.value': regex })
    // arrayImportDateConditions.push({ 'movement.importDate': regex })
    // arrayExportDateConditions.push({ 'movement.exportDate': regex })

  })

  return {
    arrayMetadataConditions,
    arrayInfosConditions,
    arrayCurrentWarehouseConditions,
    arrayOriginWarehouseConditions,
    arrayContractIdConditions,
    arrayPropertyIdConditions,
    arrayItemTypeIdConditions,
    arrayItemTypeConditions,
    arrayImportDateConditions,
    arrayExportDateConditions,
  }

}

module.exports = router;
