var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoose = require('mongoose');
var compress = require('compression')

const mongooseURL = "mongodb://127.0.0.1:27017/evaluationMng"

mongoose.connect(mongooseURL, {useNewUrlParser: true})
var db = mongoose.connection
db.on('open', ()=>{
  console.log('Connected to database successfully!')
})
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser({limit: '50mb'}))
app.use(express.json());

// app.use(bodyParser({
//   keepExtensions: true,
//   limit: 10000000, // set 10MB limit
//   defer: true              
// }));
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, '../../node_modules')))
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '../../js')));
app.use(express.static(path.join(__dirname, '../../styles')));
app.use(compress())

// app.use(bodyParser.urlencoded({limit: '50mb'}));

app.use(express.static(path.join(__dirname, '../evaluationMng/views')));

console.log('dir name from contract management: ',path.join(__dirname))


app.use('/', indexRouter);
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
