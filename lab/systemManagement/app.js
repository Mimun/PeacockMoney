var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var auth = require('../../routes/checkAuthentication')
var app = express();
app.use(bodyParser.json({limit: '50mb'}))

// view engine setup
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, '../../Components')]);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../../node_modules')))
app.use(express.static(path.join(__dirname, '../../public')))
app.use(express.static(path.join(__dirname, '../../js')))
app.use(express.static(path.join(__dirname, '../../styles')))
app.use(express.static(path.join(__dirname, '../../Components')));



const mongooseUrl = 'mongodb://localhost:27017/evaluationMng'
mongoose.connect(mongooseUrl, {useNewUrlParser: true})
var db = mongoose.connection
db.on('open', ()=>{
  console.log('Connected to database systemMng successfully!')
})

app.use('/', auth.isAuthenticated, auth.checkRole, indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
