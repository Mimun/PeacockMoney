var express = require('express');
var router = express.Router();
var Employee = require('../../../models/employee')
var Store = require('../../../models/store')
var Warehouse = require('../../../models/warehouse')
var Property = require('../../../models/property')
var Item = require('../../../models/item')
var ItemType = require('../../../models/itemType')
var Fund = require('../../../models/fund')
var Contract = require('../../../models/contract')
var ReceiptId = require('../../../models/receiptId')
var Role = require('../../../models/role')
var JobTitle = require('../../../models/jobTitle')
var async = require('async');
var atob = require('atob')
var btoa = require('btoa')
var fs = require('fs');
var _ = require('lodash');
var json2csv = require('json2csv').parse
var mongoose = require('mongoose');
const { find, result } = require('lodash');
const store = require('../../../models/store');
const checkRole = require('../../../js/roleMiddlleware')

/* GET home page. */
router.get('/', function (req, res, next) {
    // res.render('index', { title: 'Express' });
    res.redirect('employees')
});

// EMPLOYEES
// get all employees
router.get('/employees', (req, res, next) => {
    req.url = '/systemMng/employees'
    req.type = 'GET'
    next()
}, checkRole, (req, res, next) => {
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
                Employee.find({ 'metadata.value': { $ne: 'specialJobTitle' } }).exec(callback)
            } catch (err) {
                console.error(err)
            }

        },
        roles: callback => {
            try {
                Role.find({}).exec(callback)
            } catch (error) {
                console.error(error)
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

        res.render('employees', { employeeList: results.employees, storeList, roles: results.roles })
    })
})

// create new employee
router.post('/employees', (req, res, next) => {
    req.url = '/systemMng/employees'
    req.type = 'POST'
    next()
}, checkRole, (req, res, next) => {
    // console.log('req.body: ', req.body)
    var avatar = findNestedObj(req.body, 'name', 'avatar').value
    let base64Ext = avatar.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/')[1]
    let base64data = avatar.replace(/^data:image\/[a-z]+;base64,/, "")
    var name = findNestedObj(req.body, 'name', 'name').value
    if (base64data) {
        fs.writeFile(`public/images/${name}.${base64Ext}`, base64data, 'base64', (err) => {
            if (err) console.error(err)
            findNestedObj(req.body, 'name', 'avatar').value = `/images/${name}.${base64Ext}`
            var employee = new Employee(req.body)
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
router.post('/multEmployee', (req, res, next) => {
    req.url = '/systemMng/employees'
    req.type = 'POST'
    next()
}, checkRole, async (req, res) => {
    // console.log('req.body: ', req.body)
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
    req.url = '/systemMng/employees'
    req.type = 'PUT'
    next()
}, checkRole, (req, res, next) => {
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

    Employee.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, (err, result) => {
        if (err) throw err
        res.send('Update successfully!')
    })
})

// delete employee
router.delete('/employees/:id', (req, res, next) => {
    req.url = '/systemMng/employees'
    req.type = 'DELETE'
    next()
}, checkRole, (req, res, next) => {
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
    Employee.find({ $and: arrayMetadataConditions }).populate([{
        path: 'store',
        model: 'Store'
    }]).exec((err, results) => {
        if (err) throw err
        res.status(200).send({ employeeList: results })
    })

})

// STORES
// get all stores
router.get('/stores', (req, res, next) => {
    req.url = '/systemMng/stores'
    req.type = 'GET'
    next()
}, checkRole, (req, res, next) => {
    async.parallel({
        stores: callback => {
            try {
                Store.find({}).populate([{
                    path: 'representatives',
                    model: Employee
                }]).exec(callback)

            } catch (err) {
                console.error(err)
            }
        },
        employees: callback => {
            try {
                Employee.find({ isActive: true }).exec(callback)
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
        name,
        value,
        cType,
        dataVie,
        dataKor
    }
}

// create new store
router.post('/stores', (req, res, next) => {
    req.url = '/systemMng/stores'
    req.type = 'POST'
    next()
}, checkRole, (req, res, next) => {
    // console.log('req.body: ', req.body)
    var store = new Store(req.body)

    // create warehouse
    var warehouseBasedOnStore = { ...req.body, metadata: [], store: store._id }
    req.body.metadata.forEach(data => {
        if (data.name === "name" || data.name === "id" || data.name === "address" ||
            data.name === "phoneNumber" || data.name === "email" || data.name === "note") {
            warehouseBasedOnStore.metadata.push(data)
        }
    })
    findNestedObj(warehouseBasedOnStore.metadata, 'name', 'name').dataVie = 'tenKho'
    findNestedObj(warehouseBasedOnStore, 'name', 'id').dataVie = 'maKho'
    var warehouse = new Warehouse(warehouseBasedOnStore)
    var fund = new Fund({
        store: store._id,
        storeId: getNestedValue(findNestedObj(store.metadata, 'name', 'id')),
        name: findNestedObj(store, 'name', 'name').value
    })
    console.log('fund: ', fund)
    try {
        async.parallel({
            store: callback => {
                store.save(callback)
            },
            warehouse: callback => {
                warehouse.save(callback)
            },
            fund: callback => {
                fund.save(callback)
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
    req.url = '/systemMng/stores'
    req.type = 'PUT'
    next()
}, checkRole, (req, res, next) => {
    console.log('id: ', req.params.id)
    async.parallel({
        store: callback => {
            Store.findByIdAndUpdate({ _id: req.params.id }, { $set: { "metadata": req.body.metadata, "representatives": req.body.representatives, isActive: req.body.isActive } }, { new: true }).exec(callback)
        },
        warehouse: callback => {
            Warehouse.findByIdAndUpdate({ _id: req.params.id }, { $set: { "metadata": req.body.metadata, "representatives": req.body.representatives } }).exec(callback)
        },
        contracts: callback => {
            Contract.find({ 'store.value._id': new mongoose.Types.ObjectId(req.params.id) }).exec(callback)
        },
        warehouses: callback => {
            Warehouse.findOneAndUpdate({ 'store': req.params.id }, { $set: { "metadata": req.body.metadata, "representatives": req.body.representatives } }, { new: true }).exec(callback)

        },

    }, async (err, results) => {
        if (err) throw err
        console.log('contract found: ', results.contracts.length)
        await results.contracts.forEach(async contract => {
            var contractCustomId = contract.id.split('.')
            contractCustomId[0] = getNestedValue(findNestedObj(results.store.metadata, 'name', 'id'))
            var newContractCustomId = contractCustomId.join('.')
            console.log('new contract id: ', newContractCustomId)

            try {
                await Property.find({ contract: contract._id }).exec((err, result2) => {
                    if (err) throw err
                    result2.forEach(property => {
                        var customPropertyId = property.id.split('.')
                        customPropertyId[1] = getNestedValue(findNestedObj(results.store.metadata, 'name', 'id'))
                        var newPropertyCustomId = customPropertyId.join('.')
                        try {
                            Property.findOneAndUpdate({ _id: property._id }, { $set: { 'id': newPropertyCustomId } }).exec((err, result3) => {
                                if (err) throw err
                            })
                        } catch (error) {
                            console.error(error)
                        }


                    })
                })
            } catch (error) {
                console.error(error)
            }


            await Contract.findOneAndUpdate({ _id: contract._id }, { $set: { 'store.value': results.store, 'id': newContractCustomId } }).exec(err, result => {
                if (err) throw err
            })
        })
        // await Employee.find({'metadata.value': findNestedObj(results.store.metadata, 'name', 'id').value}).exec((err, result2)=>{
        //   if(err) throw err
        //   console.log('employee found: ', result2.l)
        //   // findNestedObj(result2.metadata, 'name', 'store').value = findNestedObj(results.store.metadata, 'name', 'id').value
        //   // Employee.findOneAndUpdate({_id: result2._id}, {$set: result2}).exec((err, result)=>{
        //   //   if(err) throw err

        //   // })
        // })
        await res.status(200).send("Update store and warehouse successfully!")
    })

})

// delete store
router.delete('/stores/:id', (req, res, next) => {
    req.url = '/systemMng/stores'
    req.type = 'DELETE'
    next()
}, checkRole, (req, res, next) => {
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
    req.url = '/systemMng/warehouses'
    req.type = 'GET'
    next()
}, checkRole, (req, res, next) => {
    async.parallel({
        warehouses: callback => {
            try {
                Warehouse.find({}).populate([{
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
                Employee.find({ isActive: true }).exec(callback)
            } catch (err) {
                console.error(err)
            }
        },
        stores: callback => {
            try {
                Store.find({ isActive: true }).exec(callback)
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
    req.url = '/systemMng/warehouses'
    req.type = 'POST'
    next()
}, checkRole, (req, res, next) => {
    var warehouse = new Warehouse(req.body)
    warehouse.save((err, result) => {
        if (err) throw err
        res.send('Saved successfully!')
    })
})

// update warehouse
router.put('/warehouses/:id', (req, res, next) => {
    req.url = '/systemMng/warehouses'
    req.type = 'PUT'
    next()
}, checkRole, (req, res, next) => {
    console.log('id: ', req.params.id)
    console.log('req body: ', req.body)
    Warehouse.findByIdAndUpdate({ _id: req.params.id }, {
        $set: {
            "metadata": req.body.metadata,
            "representatives": req.body.representatives,
            store: req.body.store,
            deactive: req.body.deactive
        }
    }, (err, result) => {
        if (err) throw err
        res.status(200).send("Update successfully!")
    })
})

// delete warehouse
router.delete('/warehouses/:id', (req, res, next) => {
    req.url = '/systemMng/warehouses'
    req.type = 'DELETE'
    next()
}, checkRole, (req, res, next) => {
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
                Property.find({ 'currentWarehouse._id': mongoose.Types.ObjectId(req.params.id) }).populate('contract').exec(callback)
            } catch (error) {
                console.log(error)
            }
        },
        warehouseList: callback => {
            try {
                Warehouse.find({ deactive: false }).populate([{
                    path: 'store',
                    model: 'Store'
                }]).exec(callback)
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
                if (itemObj) {
                    propertyList.push({
                        _id: itemObj._id,
                        currentWarehouse: itemObj.currentWarehouse,
                        warehouseId: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'id')) : 'None',
                        warehouseName: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'name')) : 'None',
                        contractId: itemObj.contract ? itemObj.contract.id : 'None',
                        itemTypeId: itemObj.contract ? (findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId') ? findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId').value : 'None') : '',
                        propertyId: itemObj.id,
                        propertyName: itemObj.infos[0] ? (itemObj.infos[0].value !== '' ? itemObj.infos[0].value : 'None') : 'None',
                        movement: itemObj.movement
                    })
                }
            })
        }

        res.render('properties', { propertyList, originPropertyList: result.propertyList, warehouseList, pageTitle: findNestedObj(result.warehouse, 'name', 'name').value })
    })

})

// PROPERTIES
// get all properties 
router.get('/properties', (req, res, next) => {
    req.url = '/systemMng/properties'
    req.type = 'GET'
    next()
}, checkRole, (req, res, next) => {
    async.parallel({
        propertyList: callback => {
            try {
                Property.find({}).populate('contract').exec(callback)
            } catch (error) {
                console.log(error)
            }
        },
        warehouseList: callback => {
            try {
                Warehouse.find({ deactive: false }).populate([{
                    path: 'store',
                    model: 'Store'
                }]).exec(callback)
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
                if (itemObj) {
                    propertyList.push({
                        _id: itemObj._id,
                        currentWarehouse: itemObj.currentWarehouse,
                        warehouseId: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'id')) : 'None',
                        warehouseName: itemObj.currentWarehouse ? getNestedValue(findNestedObj(itemObj.currentWarehouse.metadata, 'name', 'name')) : 'None',
                        contractId: itemObj.contract ? itemObj.contract.id : 'None',
                        itemTypeId: itemObj.contract ? (findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId') ? findNestedObj(itemObj.contract.templateMetadata, 'name', 'itemTypeId').value : 'None') : '',
                        propertyId: itemObj.id,
                        propertyName: itemObj.infos[0] ? (itemObj.infos[0].value !== '' ? itemObj.infos[0].value : 'None') : 'None',
                        movement: itemObj.movement
                    })
                }
            })
        }

        res.render('properties', { propertyList, originPropertyList: result.propertyList, warehouseList, pageTitle: '' })
    })

})

// update property
router.put('/properties/:id', (req, res, next) => {
    req.url = '/systemMng/properties'
    req.type = 'PUT'
    next()
}, checkRole, (req, res, next) => {
    console.log('id: ', req.params.id)
    console.log('body: ', req.body)
    var updateObj = req.body
    Warehouse.findOne({ _id: updateObj.currentWarehouse }).exec((err, result) => {
        if (err) throw err
        updateObj.currentWarehouse = result
        console.log('updateObj: ', updateObj)
        Property.findOneAndUpdate({ _id: req.params.id }, { $set: updateObj }, { new: true }, (err, result) => {
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
router.get('/statistic', (req, res, next) => {
    req.url = '/systemMng/statistic'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
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
    Property.find({}).populate('contract').sort({ _id: -1 }).exec((err, result) => {
        if (err) throw err
        callback(result, dateConditions, res)
    })

})

// get statistic/report for exported properties
router.post('/statistic/export', (req, res) => {
    console.log('req body: ', req.body)
    var chosenWarehouse = req.body.warehouses
    var dateConditions = req.body.dateConditions
    Property.find({}).populate('contract').sort({ _id: -1 }).exec((err, result) => {
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
    }).populate('contract').sort({ _id: -1 }).exec((err, result) => {
        if (err) throw err
        req.body.type === 'import' ? callback(result, dateConditions, res) :
            callback2(result, dateConditions, res)
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
                        customerId: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customerId')) : 'No customer id',
                        customerName: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customer')) : 'No customer',
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
                        customerId: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customerId')) : 'No customer id',
                        customerName: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customer')) : 'No customer',
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
        "customerId", "customerName", "itemTypeId", "itemType", "warehouseFrom", "importNote"
    ]
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
                        customerId: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customerId')) : 'No customer id',
                        customerName: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customer')) : 'No customer',
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
                        customerId: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customerId')) : 'No customer id',
                        customerName: res.contract.contractMetadata ? getNestedValue(findNestedObj(res.contract.contractMetadata, 'name', 'customer')) : 'No customer',
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
        "customerId", "customerName", "itemTypeId", "itemType", "warehouseTo", "exportNote"
    ]
    let csv = json2csv(array, { fields })
    res.status(200).send({ result: array, originResult: result, csv, reportType: 'export' })
}

// ITEM TYPE
// get item type
router.get('/itemType', (req, res, next) => {
    req.url = '/systemMng/itemType'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    ItemType.find().exec((err, result) => {
        if (err) throw err
        res.render('itemTypes', { itemTypeList: result })
    })
})

// create new item type
router.post('/itemType', (req, res, next) => {
    req.url = '/systemMng/itemType'
    req.type = 'POST'
    next()
}, checkRole, (req, res) => {
    console.log('req body: ', req.body)
    var itemType = new ItemType(req.body)
    itemType.save((err, result) => {
        if (err) throw err
        res.send('Save item type successfully!')
    })
})

router.put('/itemType/:id', (req, res) => {
    try {
        if (req.body._id) {
            ItemType.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }).exec((err, result) => {
                if (err) throw err
                res.send('Update successfully!')
            })
        } else {
            res.send('Update failed')
        }

    } catch (error) {
        console.error(error)

    }
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
                    storeId,
                    warehouseId,
                    warehouseName,
                    importDate,
                    contractid,
                    propertyId,
                    propertyName,
                    customerId,
                    customerName,
                    itemTypeId,
                    itemTypeName,
                    warehouseFrom,
                    importNote
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

// test loan 
router.get('/testLoan1', (req, res) => {
    res.render('testLoan1_v2', { simulation: 1, title: 'Bảng tính lãi theo dư nợ cố định', penaltyRateTitle: 'ngày' })
})

router.get('/testLoan2', (req, res) => {
    res.render('testLoan1_v2', { simulation: 2, title: 'Bảng tính lãi theo dư nợ giảm dần gốc cố định', penaltyRateTitle: 'ngày' })
})

router.get('/testLoan3', (req, res) => {
    res.render('testLoan1_v2', { simulation: 3, title: 'Bảng tính lãi theo dư nợ giảm dần hàng tháng', penaltyRateTitle: 'tháng' })
})

router.get('/testLoan4', (req, res) => {
    res.render('testLoan1_v2', { simulation: 4, title: 'Bảng tính lãi theo dư nợ cố định (trả đầu kỳ)', penaltyRateTitle: 'ngày' })
})

router.get('/testPaydown1', (req, res) => {
    res.render('testPaydown1', { simulation: 1 })
})

router.get('/testPaydown2', (req, res) => {
    res.render('testPaydown2', { simulation: 2 })
})

router.get('/testPaydown3', (req, res) => {
    res.render('testPaydown3', { simulation: 3 })
})

router.get('/testPaydown4', (req, res) => {
    res.render('testPaydown4', { simulation: 4 })
})

// funding management
router.get('/funds', (req, res, next) => {
    req.url = '/systemMng/funds'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    Fund.find({}).exec((err, result) => {
        res.render('funds', { fundList: result })
    })
})

// get fund detail
router.get('/funds/:id', (req, res, next) => {
    req.url = '/systemMng/funds'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    async.parallel({
        funds: callback => {
            Fund.find().exec(callback)
        },
        fund: callback => {
            Fund.findOne({ _id: req.params.id }).exec(callback)
        }
    }, (err, results) => {
        res.render('fund', { fund: results.fund, fundList: results.funds })
    })

})

// transfer money
router.put('/funds/:id', (req, res, next) => {
    req.url = '/systemMng/funds'
    req.type = 'PUT'
    next()
}, checkRole, (req, res) => {
    console.log('req body: ', req.body)
    var obj = req.body
    async.parallel({
        fundFrom: callback => {
            // var id = mongoose.Types.ObjectId.isValid(req.body.from) ? mongoose.Types.ObjectId(req.body.from) : null
            var id = req.body.from
            console.log('id from: ', id)

            if (id) {
                Fund.findOne({ store: id }).exec(callback)
            } else {
                callback(null, {})
            }
        },
        fundTo: callback => {
            var id = req.body.to
            console.log('id to: ', id)

            if (id) {
                Fund.findOne({ store: id }).exec(callback)

            } else {
                callback(null, {})
            }

        }
    }, (err, results) => {
        if (err) throw err
        console.log('results: ', results)
        var fundFrom = results.fundFrom
        var fundTo = results.fundTo
        try {
            switch (obj.type) {
                case ('cash'):
                    if (fundFrom && !_.isEmpty(fundFrom)) {
                        fundFrom.cash = parseFloat(fundFrom.cash) - parseFloat(obj.value)
                        fundFrom.transHistory.push({ ...obj, value: -obj.value })
                    }

                    if (fundTo && !_.isEmpty(fundTo)) {
                        fundTo.cash = parseFloat(fundTo.cash) + parseFloat(obj.value)
                        fundTo.transHistory.push({ ...obj, value: +obj.value })
                    }
                    break
                case ('iCash'):
                    if (fundFrom && !_.isEmpty(fundFrom)) {
                        fundFrom.iCash = parseFloat(fundFrom.iCash) - parseFloat(obj.value)
                        fundFrom.transHistory.push({ ...obj, value: -obj.value })
                    }

                    if (fundTo && !_.isEmpty(fundTo)) {
                        fundTo.iCash = parseFloat(fundTo.iCash) + parseFloat(obj.value)
                        fundTo.transHistory.push({ ...obj, value: +obj.value })
                    }
                    break
                default:
            }
            console.log('fund from after transferring: ', fundFrom)
            console.log('fund to after transferring: ', fundTo)

            async.parallel({
                fundFrom: callback => {
                    if (fundFrom) {
                        Fund.findOneAndUpdate({ _id: fundFrom._id }, { $set: fundFrom }).exec(callback)

                    } else {
                        callback(null, {})
                    }
                },
                fundTo: callback => {
                    if (fundTo) {
                        Fund.findOneAndUpdate({ _id: fundTo._id }, { $set: fundTo }).exec(callback)

                    } else {
                        callback(null, {})
                    }
                }
            }, (err, results) => {
                if (err) throw err
                res.send('save successfully')
            })
        } catch (error) {
            console.error(error)
        }
    })
})

const handleReceiptArray = (chosenDate, chosenMonth, fund, callback) => {
    console.log('chosen month: ', chosenMonth, ', chosen date: ', chosenDate)

    try {
        var dailyMoneyReport = [],
            monthlyMoneyReport = []
        if (fund && fund.receiptRecords.length !== 0) {

            fund.receiptRecords.forEach(receipt => {
                if (new Date(receipt.date).getDate() === new Date(chosenDate).getDate() &&
                    new Date(receipt.date).getMonth() === new Date(chosenDate).getMonth() &&
                    new Date(receipt.date).getFullYear() === new Date(chosenDate).getFullYear()) {
                    dailyMoneyReport.push(receipt)
                }
                if (new Date(receipt.date).getDate() <= new Date(chosenDate).getDate() &&
                    new Date(receipt.date).getMonth() === new Date(chosenDate).getMonth() &&
                    new Date(receipt.date).getFullYear() === new Date(chosenDate).getFullYear()) {
                    monthlyMoneyReport.push(receipt)
                    return receipt
                }

            })
        }
        callback(dailyMoneyReport, monthlyMoneyReport)
    } catch (error) {
        console.error(error)
    }
}

// money report of each store
router.get('/moneyReport', (req, res, next) => {
    req.url = '/systemMng/moneyReport'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    var chosenDate = new Date(Date.now())
    var chosenMonth = chosenDate.getMonth()
    async.parallel({
        stores: callback => {
            Store.find({}).exec(callback)
        },
        contracts: callback => {
            Contract.find({ 'store.value._id': req.body.store }).exec(callback)
        },
        fund: callback => {
            Fund.findOne({ store: req.body.store }).exec(callback)
        }
    }, (err, results) => {
        if (err) throw err
        console.log('fund: ', results.fund)
        handleReceiptArray(chosenDate, chosenMonth, results.fund, (dailyMoneyReport, monthlyMoneyReport) => {
            res.render('moneyReport', { stores: results.stores, contracts: results.contracts, dailyMoneyReport, monthlyMoneyReport })
        })

    })

})

router.post('/moneyReport/getReport', (req, res, next) => {
    req.url = '/systemMng/moneyReport'
    req.type = 'GET'
    req.checkStores = true

    next()
}, checkRole, (req, res) => {
    console.log('req body: ', req.body)
    var chosenDate = new Date(req.body.date)
    var chosenMonth = chosenDate.getMonth()
    async.parallel({
        store: callback => {
            Store.findOne({ _id: req.body.store }).exec(callback)
        },
        contracts: callback => {
            Contract.find({ 'store.value._id': req.body.store }).exec(callback)
        },
        fund: callback => {
            Fund.findOne({ store: req.body.store }).exec(callback)
        }
    }, (err, results) => {
        if (err) throw err
        handleReceiptArray(chosenDate, chosenMonth, results.fund, (dailyMoneyReport, monthlyMoneyReport) => {
            res.send({ store: results.store, contracts: results.contracts, dailyMoneyReport, monthlyMoneyReport })
        })
    })
})

// money report of company
const handleReceiptArray2 = (chosenDate, chosenMonth, funds, callback) => {
    try {
        var dailyMoneyReport = [],
            monthlyMoneyReport = [],
            customFundReceiptRecords = []
        funds.forEach(fund => {
            customFundReceiptRecords = customFundReceiptRecords.concat(fund.receiptRecords)
        })
        console.log('custom fund receipt: ', customFundReceiptRecords)
        if (customFundReceiptRecords && customFundReceiptRecords.length !== 0) {

            customFundReceiptRecords.forEach(receipt => {
                if (new Date(receipt.date).getDate() === new Date(chosenDate).getDate() &&
                    new Date(receipt.date).getMonth() === new Date(chosenDate).getMonth() &&
                    new Date(receipt.date).getFullYear() === new Date(chosenDate).getFullYear()) {
                    dailyMoneyReport.push(receipt)
                }
                if (new Date(receipt.date).getDate() <= new Date(chosenDate).getDate() &&
                    new Date(receipt.date).getMonth() === new Date(chosenDate).getMonth() &&
                    new Date(receipt.date).getFullYear() === new Date(chosenDate).getFullYear()) {
                    monthlyMoneyReport.push(receipt)
                    return receipt
                }

            })
        }
        callback(dailyMoneyReport, monthlyMoneyReport)
    } catch (error) {
        console.error(error)
    }
}

router.get('/companyMoneyReport', (req, res, next) => {
    req.url = '/systemMng/companyMoneyReport'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    var chosenDate = new Date(Date.now())
    var chosenMonth = chosenDate.getMonth()
    async.parallel({
        stores: callback => {
            Store.find({}).exec(callback)
        },
        contracts: callback => {
            Contract.find({}).exec(callback)
        },
        funds: callback => {
            Fund.find({}).exec(callback)
        }
    }, (err, results) => {
        if (err) throw err
        handleReceiptArray2(chosenDate, chosenMonth, results.funds, (dailyMoneyReport, monthlyMoneyReport) => {
            res.render('companyMoneyReport', { store: results.stores, contracts: results.funds, dailyMoneyReport, monthlyMoneyReport })

        })
    })
})

router.post('/companyMoneyReport/getReport', (req, res, next) => {
    req.url = '/systemMng/companyMoneyReport'
    req.type = 'GET'
    req.checkStores = true

    next()
}, checkRole, (req, res) => {
    console.log('req body: ', req.body)
    var chosenDate = new Date(req.body.date)
    var chosenMonth = chosenDate.getMonth()
    async.parallel({
        stores: callback => {
            Store.find({}).exec(callback)
        },
        contracts: callback => {
            Contract.find({}).exec(callback)
        },
        funds: callback => {
            Fund.find().exec(callback)
        }

    }, (err, results) => {
        if (err) throw err
        console.log('results contract: ', results.contracts.length)
        handleReceiptArray2(chosenDate, chosenMonth, results.funds, (dailyMoneyReport, monthlyMoneyReport) => {
            console.log('daily result: ', dailyMoneyReport.length)
            console.log('monthly result: ', monthlyMoneyReport.length)

            res.send({ store: results.stores, funds: results.funds, dailyMoneyReport, monthlyMoneyReport })
        })
    })
})

// statistic report
const handleReceiptArray3 = (chosenDate, chosenMonth, contracts, callback) => {
    try {
        var dailyMoneyReport = [],
            monthlyMoneyReport = [],
            totalMoneyReport = []
        if (contracts.length !== 0) {
            contracts.forEach(contract => {
                var itemType = getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'itemType'))
                var itemTypeId = getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'itemTypeId'))
                console.log('item type: ', itemType)
                if (contract.loanPackage && contract.loanPackage.receiptRecords.length !== 0) {
                    contract.loanPackage.receiptRecords.forEach(receipt => {
                        if (new Date(receipt.date).getDate() === chosenDate.getDate() &&
                            new Date(receipt.date).getMonth() === chosenDate.getMonth() &&
                            new Date(receipt.date).getFullYear() === chosenDate.getFullYear()) {
                            if (receipt !== null) {
                                dailyMoneyReport.push({
                                    ...receipt,
                                    storeId: receipt.storeId,
                                    itemType: itemType,
                                    itemTypeId: itemTypeId,
                                    contractId: contract.id,
                                    presentValue: contract.loanPackage.presentValue
                                })
                            }
                        }
                    })

                    contract.loanPackage.receiptRecords.map(receipt => {
                        if (new Date(receipt.date).getDate() <= new Date(chosenDate).getDate() &&
                            new Date(receipt.date).getMonth() === new Date(chosenDate).getMonth() &&
                            new Date(receipt.date).getFullYear() === new Date(chosenDate).getFullYear()) {
                            if (receipt !== null) {
                                monthlyMoneyReport.push({
                                    ...receipt,
                                    storeId: receipt.storeId,
                                    itemType: itemType,
                                    itemTypeId: itemTypeId,
                                    contractId: contract.id,
                                    presentValue: contract.loanPackage.presentValue
                                })
                            }

                        }
                    })

                    contract.loanPackage.receiptRecords.forEach(receipt => {
                        if (new Date(receipt.date).getDate() <= new Date(chosenDate).getDate() &&
                            new Date(receipt.date).getMonth() <= new Date(chosenDate).getMonth() &&
                            new Date(receipt.date).getFullYear() === new Date(chosenDate).getFullYear()) {
                            if (receipt !== null) {
                                totalMoneyReport.push({
                                    ...receipt,
                                    storeId: receipt.id ? receipt.id.split('.')[0] : '-',
                                    itemType: itemType,
                                    itemTypeId: itemTypeId,
                                    contractId: contract.id,
                                    presentValue: contract.loanPackage.presentValue
                                })
                            }
                        }
                    })
                }
            })
        }
        callback(dailyMoneyReport, monthlyMoneyReport, totalMoneyReport)
    } catch (error) {
        console.error(error)
    }
}

router.get('/statisticReport', (req, res, next) => {
    req.url = '/systemMng/statisticReport'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    var chosenDate = new Date(Date.now())
    var chosenMonth = chosenDate.getMonth()
    async.parallel({
        stores: callback => {
            Store.find({}).exec(callback)
        },
        contracts: callback => {
            Contract.find({}).exec(callback)
        }
    }, (err, results) => {
        if (err) throw err
        var stores = results.stores.map(res => {
            return {
                storeId: getNestedValue(findNestedObj(res.metadata, 'name', 'id')),
                storeName: getNestedValue(findNestedObj(res.metadata, 'name', 'name'))
            }
        })
        handleReceiptArray3(chosenDate, chosenMonth, results.contracts, (dailyMoneyReport, monthlyMoneyReport, totalMoneyReport) => {
            res.render('statisticReport', { stores, contracts: results.contracts, dailyMoneyReport, monthlyMoneyReport, totalMoneyReport })

        })

    })

})

router.post('/statisticReport/getReport', (req, res, next) => {
    req.url = '/systemMng/statisticReport'
    req.type = 'GET'
    req.checkStores = true

    next()
}, checkRole, (req, res) => {
    console.log('req body: ', req.body)
    var chosenDate = new Date(req.body.date)
    var chosenMonth = chosenDate.getMonth()
    Contract.find({}).exec((err, result) => {
        if (err) throw err
        handleReceiptArray3(chosenDate, chosenMonth, result, (dailyMoneyReport, monthlyMoneyReport, totalMoneyReport) => {
            res.send({ contracts: result, dailyMoneyReport, monthlyMoneyReport, totalMoneyReport })

        })
    })
})

// check table summary report
router.get('/checkTableSummaryReport', (req, res, next) => {
    req.url = '/systemMng/checkTableSummaryReport'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    res.render('checkTableSummaryReport', {})
})

router.post('/checkTableSummaryReport/getReport', (req, res, next) => {
    req.url = '/systemMng/checkTableSummaryReport'
    req.type = 'GET'
    req.checkStores = true
    next()
}, checkRole, (req, res) => {
    var chosenDate = new Date(req.body.date)
    Contract.find({}).exec((err, result) => {
        if (err) throw err
        var loanPackages = result.map(contrat => {
            return contrat.loanPackage
        })
        res.send({ loanPackages })
    })
})

// handle contract array function
const handleGetContract = (contracts, properties) => {
    // return a customized array of contract
    var contractList = contracts.map(contract => {
        if (contract && contract.loanPackage) {
            console.log('contracat length: ', contracts.length)
            var mergeWithObj = null
            var numberOfLatePeriods = 0,
                numberOfLateDays = 0,
                lastPaidDate = '',
                interestSoFar = 0
            // number of late periods
            if (contract.loanPackage) {
                var latePeriodsArray = contract.loanPackage.periodRecords.filter(period => {
                    return period.daysBetween > 0 && period.periodStatus === false

                })
                numberOfLatePeriods = latePeriodsArray.length
                latePeriodsArray.forEach(period => {
                    numberOfLateDays += period.daysBetween > 0 ? period.daysBetween : 0
                })

                lastPaidDate = contract.loanPackage.receiptRecords[contract.loanPackage.receiptRecords.length - 1] ?
                    (contract.loanPackage.receiptRecords[contract.loanPackage.receiptRecords.length - 1].date) : '-'

                mergeWithObj = _.mergeWith({}, ...contract.loanPackage.periodRecords, _.add)
                switch (contract.simulation) {
                    case 3:
                        var numberOfPeriods = contract.periodRecords.filter(period => {
                            if (new Date(period.redemptionDate).getTime() <= new Date(Date.now()).getTime()) {
                                return period
                            }
                        })
                        interestSoFar = numberOfPeriods.length * contract.interestRate
                        break;

                    default:
                        interestSoFar = ((new Date(Date.now()).getTime() - new Date(contract.loanPackage.agreementDate).getTime()) / (1000 * 3600 * 24)) * parseFloat(contract.loanPackage.interestRate)

                        break;
                }
                // console.log('merge obj: ', mergeWithObj)
            }
            // get properties
            var propertiesArray = []
            properties.forEach(property => {
                //     console.log({propertyContractId: property.contract._id,
                //     typeofPropertyContractId: typeof property.contract._id,
                //   contractId: contract._id,
                // typeofContractId: typeof contract._id})
                if (property && JSON.stringify(property.contract) === JSON.stringify(contract._id)) {
                    propertiesArray.push({
                        isIn: property.isIn,
                        name: getNestedValue(findNestedObj(property.infos, 'name', 'Tên tài sản')),
                        store: getNestedValue(findNestedObj(property.currentWarehouse.metadata, 'name', 'name'))
                    })
                }
            })
            var contractCreatedDate = getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractCreatedDate'))
            var contractEndingDate = getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'contractEndingDate'))
            var owedLoanDue = new Date(contract.loanPackage.realLifeDate) > new Date(contractEndingDate) && contract.loanPackage.presentValue !== 0 ? contract.loanPackage.presentValue : 0
            var owedLoanNotDue = new Date(contract.loanPackage.realLifeDate) <= new Date(contractEndingDate) && contract.loanPackage.presentValue !== 0 ? contract.loanPackage.presentValue : 0
            var owedInterest = 0
            contract.loanPackage.periodRecords.forEach(period => {
                if (!period.periodStatus) {
                    owedInterest += period.remainInterest
                }
            })
            var totalOwedDue = owedLoanDue + owedInterest
            var loanDaysOverdue = new Date(contract.loanPackage.realLifeDate) - new Date(contractEndingDate)
            var latePeriodsArray = contract.loanPackage.periodRecords.filter(period => {
                return period.daysBetween > 0 && period.periodStatus === false

            })
            var numberOfLatePeriods = latePeriodsArray.length
            var numberOfLateDays = 0
            latePeriodsArray.forEach(period => {
                numberOfLateDays += period.daysBetween > 0 ? period.daysBetween : 0
            })
            var obj = {
                contract_Id: contract._id,

                storeId: getNestedValue(findNestedObj(contract.store.value.metadata, 'name', 'id')),
                contractId: contract.id,
                customer: getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'customer')),
                contractCreatedDate: formatDate(contractCreatedDate),
                contractEndingDate: formatDate(contractEndingDate),
                loan: parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan'))) ? parseFloat(getNestedValue(findNestedObj(contract.contractMetadata, 'name', 'loan'))) : 0,
                itemType: getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'itemType')),
                itemName: getNestedValue(findNestedObj(contract.templateMetadata, 'name', 'itemType')).split('loai')[1],
                owedLoanNotDue,
                owedLoanDue,
                owedInterest,
                totalOwedDue,
                loanDaysOverdue: loanDaysOverdue <= 0 ? 0 : loanDaysOverdue,
                numberOfLateDays,
                numberOfLatePeriods,
                reminding_status: contract.loanPackage.reminding_status ? contract.loanPackage.reminding_status : '',
                reminding_detail: contract.loanPackage.reminding_detail ? contract.loanPackage.reminding_detail : '',
                loanPackage: contract.loanPackage
            }
            // console.log('obj acb: ', obj)
            return obj
        }
    })
    return contractList

}

// debt report
router.get('/debtReport', async (req, res) => {
    async.parallel({
        contracts: callback => {
            Contract.find({}).exec(callback)
        },
        properties: callback => {
            Property.find({}).populate('contract').exec(callback)
        }
    }, async (err, results) => {
        if (err) throw err
        const debts = handleGetContract(results.contracts, results.properties)
        res.render('debtReport', { debts })
    })

})

// get receipt id
router.get('/receiptId', (req, res, next) => {
    req.url = '/systemMng/receiptId'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    ReceiptId.find({}).exec((err, result) => {
        if (err) throw err
        res.render('receiptId', { receiptIdList: result })

    })
})

router.post('/receiptId', (req, res, next) => {
    req.url = '/systemMng/receiptId'
    req.type = 'POST'
    next()
}, checkRole, (req, res) => {
    console.log('req body: ', req.body)
    new ReceiptId(req.body).save((err, result) => {
        if (err) throw err
        res.send({ message: 'Save to db successfully!' })
    })
})

router.put('/receiptId/:id', (req, res) => {
    try {
        ReceiptId.findOneAndUpdate({ _id: req.body._id }, { $set: req.body }).exec((err, result) => {
            if (err) throw err
            res.send('Update successfully!')
        })
    } catch (error) {
        console.error(error)

    }
})

// role management
router.get('/roles', (req, res, next) => {
    req.url = '/systemMng/roles'
    req.type = 'GET'
    next()
}, checkRole, (req, res) => {
    async.parallel({
        roles: callback => {
            Role.find({}).exec(callback)
        },
        stores: callback => {
            Store.find({ isActive: true }).exec(callback)
        }
    }, (err, results) => {
        if (err) throw err
        var stores = results.stores.map(store => {
            var name = getNestedValue(findNestedObj(store, 'name', 'name'))
            var _id = store._id
            var customId = getNestedValue(findNestedObj(store, 'name', 'id'))
            return {
                name,
                id: _id,
                customId
            }
        })
        res.render('roles', { roles: results.roles, stores })

    })

})

router.post('/roles', (req, res, next) => {
    req.url = '/systemMng/roles'
    req.type = 'POST'
    next()
}, checkRole, async (req, res) => {
    console.log('req body: ', req.body)
    Role.findOne({ name: req.body.name }).exec((err, result) => {
        if (err) throw err
        if (!result) {
            new Role(req.body).save((err, result) => {
                if (err) throw err
                res.send('Save successfully!')
            })
        } else {
            Role.findOneAndUpdate({ name: req.body.name }, { $set: req.body }).exec((err, result1) => {
                if (err) throw err
                res.send('Update successfully!')
            })
        }
    })

})

router.delete('/roles/:id', (req, res, next) => {
    Role.findOneAndDelete({ _id: req.params.id }).exec((err, result) => {
        if (err) throw err
        res.send("Delete successfully!")
    })
})

router.post('/jobTitle', async (req, res) => {
    console.log('req body: ', req.body)
    try {
        Role.findOne({ name: req.body.role }).select('name abilities').exec(async (err, result) => {
            if (err) throw err
            if (result) {
                await new JobTitle({
                    ...req.body,
                    role: new mongoose.Types.ObjectId(result._id)
                }).save()
                res.send('Save successfylly!')
            } else {
                res.send({ success: false, message: 'Failed to save!' })
            }
        })
    } catch (error) {
        console.error(error)
    }

})

module.exports = router;