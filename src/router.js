/* HOME PAGE */
const homePageRouter = require('./routes/homepage.router');

/* USER */
const usersRouter = require('./routes/users.router');

/* TRANSACTION */
const transactionRouter = require('./routes/transaction.router');

/* CARD */
const cardRouter = require('./routes/card.router');

/* TRANSFER */
const transferRouter = require('./routes/transfer.router');

/* ACCOUNT */
const accountRouter = require('./routes/account.router');

// MIDDLEWARE
const Middleware = require('./middleware.js')

const requestRouter = (app) => {
    app.use(Middleware.requireAdmin)
    app.use(Middleware.requireActive)
    app.use('/users', usersRouter);
    app.use('/card', cardRouter);
    app.use('/transaction', transactionRouter);
    app.use('/account', accountRouter);
    app.use('/transfer', transferRouter);
    app.use('/', homePageRouter);
}

module.exports = requestRouter;
