var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

var logger = require('morgan');
var mysql = require('mysql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var studentRouter = require('./routes/studentRouter');
var teacherRouter = require('./routes/teacherRouter');
var adminRouter = require('./routes/adminRouter');
var deanRouter = require('./routes/deanRouter');


var app = express();
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next)=>
{
	res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,VIEW,PATCH');
	res.header('Access-Control-Allow-Headers', '*');

	next();
});


// routers

app.use('/student',studentRouter);
app.use('/teacher',teacherRouter);
app.use('/admin',adminRouter);
app.use('/dean',deanRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);



app.get('/zain',function(req,res){
	// connection.query("SELECT * FROM sampletable",function(error,rows,fields){
	// 	if(error){
	// 		console.log("ERROR in query");
	// 	}
	// 	else{
	// 		console.log("Successful query");
	// 		console.log(rows);
	// 		console.log(fields);
	// 		res.send(rows);
	// 	}
	// });
});


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
