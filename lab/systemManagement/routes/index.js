var express = require('express');
var router = express.Router();
var Employee = require('../models/employee')

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

// get creating employees
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



module.exports = router;
