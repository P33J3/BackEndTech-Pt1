var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
const passport = require('passport');
//const authenticate = require('./authenticate');
//replaced authenticate with config when using JWT
const config = require('./config');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');


//const url = 'mongodb://localhost:27017/nucampsite';
const url = config.mongoUrl;

const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
    err => console.log(err)
    ); 

var app = express();

app.all('*', (req, res, next) => {
    if (req.secure) {
      return next();
    } else {
        console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
        res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
    }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//when using session, it has its own cookie parser so we comment out below
//app.use(cookieParser('12345-67890-09876-54321'));

// app.use(session({
//     name: 'session-id',
//     secret: '12345-67890-09876-54321',
//     saveUninitialized: false,
//     resave: false,
//     store: new FileStore()
// }));

//these are only necessary if you uses session based authentication
//these are two middleware functions provided by passport to check if a session exists for a user
app.use(passport.initialize());
//app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

//auth function below used with cookies and sessions but not with web tokens
//no longer protecting the static files in the public folder

// function auth(req,res, next) {
//     //console.log('header', req.headers);
//     //signedCookies comes from cookieParser
//     //console.log(req.session);
//     console.log(req.user);
//     //no access to signedCookies because we're not using cookieParser
//     //if (!req.signedCookies.user) {

//         if (!req.user) {
//      // if (!req.session.user) {
//         //being handled by user router
//           // const authHeader = req.headers.authorization;
//           // if (!authHeader) {
//             const err = new Error('You are not authenticated!');
//             //res.setHeader('WWW-Authenticate', 'Basic');
//             err.status = 401;
//             return next(err);
//           }
      
//           // const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//           // const user = auth[0];
//           // const pass = auth[1];
//           // if (user === 'admin' && pass === 'password') {
//           //   //{signed: true} allows cookieParser to use special key to encrypt cookies
//           //   // res.cookie('user', 'admin', {signed: true}); (use with cookieParser)
//           //   req.session.user = 'admin';
//           //     return next(); //authorized
//           // } else {
//           //   const err = new Error('You are not authenticated!');
//           //   res.setHeader('WWW-Authenticate', 'Basic');
//           //   err.status = 401;
//           //   return next(err);
//           // }
//         else {
//           //if (req.signedCookies.user === 'admin') {
//             // if (req.session.user === 'admin') {
//           //     if (req.session.user === 'authenticated') {
//           //   return next();
//           // } else {
//           //   const err = new Error('You are not authenticated!');
//           //   err.status = 401;
//             // return next(err);
//             return next();
//           }
//         }
      
    


// app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

//moved these above the auth function so that users can access them.
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);
app.use('/imageUpload', uploadRouter);

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
