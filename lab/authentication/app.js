var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views',[path.join(__dirname, 'views'), path.join(__dirname, '../../Components')]);
app.set('view engine', 'ejs');
app.use(bodyParser({limit: '50mb'}))
app.use(express.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, '../../node_modules')))
app.use(express.static(path.join(__dirname, '../../Components')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// connect to mongoose
var mongooseURL = "mongodb://127.0.0.1:27017/evaluationMng"
mongoose.connect(mongooseURL, {useNewUrlParser: true})
var db = mongoose.connection
db.on('open', ()=>{
  console.log('Authentication connected to database successfully!')
})

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
