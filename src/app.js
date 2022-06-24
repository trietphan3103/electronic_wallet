const createError = require('http-errors');
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
var cookies = require("cookie-parser");
const expressLayouts = require('express-ejs-layouts');
const Middleware = require('./middleware.js')
var moment = require('moment');

const requestRouter = require('./router.js');
const { validatePublicUrl } = require('./utils.js');
const e = require('express');

const PORT = 4444;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.use(expressLayouts)
app.use(cookies());
app.use(fileUpload());
app.use((req, res, next) => {
  res.locals.moment = moment;
  next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');

app.use(Middleware.checkFisrtLogin);

// Middleware handle login
app.use(function(req, res, next) {
  if(req.url.startsWith("/css/") || validatePublicUrl(req.url)){
    next();
    return;
  }

  if(req.url === "/users/login") {
    if(req.cookies && req.cookies[process.env.TOKEN]){
      res.redirect("/");
      return
    }
    next();
    return;
  }

  if(!(req.cookies && req.cookies[process.env.TOKEN])){
    res.redirect("/");
    return
  }

  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(Middleware.checkConnection);

requestRouter(app);

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
  if (err.status === 404) {
    res.render('error404');
  } else {
    res.status(err.status || 500);
    res.render('error');
  }
});

(async function(){
    app.set('port', PORT);
    await app.listen(app.get('port'));
    console.log(`Application is running on: http://localhost:${PORT}`)
}());

module.exports = app;
