var express = require('express');
var router = express.Router();
var Employee = require('../models/employee')
var Store = require('../models/store')
var Warehouse = require('../models/warehouse')

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.redirect('employees')
});

// EMPLOYEES
// get all employees
router.get('/employees', (req, res, next)=>{
  Employee.find({}, (err, results)=>{
    if(err) throw err
    res.render('employees', {employeeList: results})
  })
})

// create new employee
router.post('/employees', (req, res, next)=>{
  console.log('req.body: ', req.body)
  var employee = new Employee(req.body)
  employee.save((err, result)=>{
    if(err) throw err
    if(result){
      res.send('Saved successfully!')

    }
  })
})

// upate employee
router.put('/employees/:id', (req, res, next)=>{
  console.log('id: ', req.params.id)
  Employee.findByIdAndUpdate({_id: req.params.id}, {$set: {'metadata': req.body.metadata}}, (err, result)=>{
    if(err) throw err
    res.send('Update successfully!')
  })
})

// delete employee
router.delete('/employees/:id', (req, res, next)=>{
  console.log('id: ', req.params.id)
  Employee.findByIdAndDelete({_id: req.params.id}, (err, result)=>{
    if(err) throw err
    res.send('Delete successfully!')
  })
})

// STORES
// get all stores
router.get('/stores', (req, res, next)=>{
  Store.find({}, (err, result)=>{
    if(err) throw err
    res.render('stores', {storeList: result})
  })
})

// create new store
router.post('/stores', (req, res, next)=>{
  console.log('req.body: ', req.body)
  var store = new Store(req.body)
  store.save((err, result)=>{
    if(err) throw err
    res.send('Saved successfully!')
  })
})

// update store
router.put('/stores/:id', (req, res, next)=>{
  console.log('id: ', req.params.id)
  Store.findByIdAndUpdate({_id: req.params.id}, {$set: {"metadata": req.body.metadata}}, (err, result)=>{
    if(err) throw err
    res.status(200).send("Update successfully!")
  })
})

// delete store
router.delete('/stores/:id', (req, res, next)=>{
  console.log('id: ', req.params.id)
  Store.findByIdAndDelete({_id: req.params.id}, (err, result)=>{
    if(err) throw err
    res.status(200).send("Delete successfully!")
  })
})

// WAREHOUSE
// get all warehouses
router.get('/warehouses', (req, res, next)=>{
  Warehouse.find({}, (err, result)=>{
    if(err) throw err
    res.render('warehouses', {warehouseList: result})
  })
})

// create new warehouse
router.post('/warehouses', (req, res, next)=>{
  console.log('req.body: ', req.body)
  var warehouse = new Warehouse(req.body)
  warehouse.save((err, result)=>{
    if(err) throw err
    res.send('Saved successfully!')
  })
})

// update warehouse
router.put('/warehouses/:id', (req, res, next)=>{
  console.log('id: ', req.params.id)
  Warehouse.findByIdAndUpdate({_id: req.params.id}, {$set: {"metadata": req.body.metadata}}, (err, result)=>{
    if(err) throw err
    res.status(200).send("Update successfully!")
  })
})

// delete warehouse
router.delete('/warehouses/:id', (req, res, next)=>{
  console.log('id: ', req.params.id)
  Warehouse.findByIdAndDelete({_id: req.params.id}, (err, result)=>{
    if(err) throw err
    res.status(200).send("Delete successfully!")
  })
})


module.exports = router;
