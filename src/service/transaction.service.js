const con = require("../connection.js");
const Middleware = require("../middleware");
const { getCurrentUserId } = require("../utils.js");

const TransactionService = {
  createDeposit : (user_id, deposit_amount) => {
    return new Promise(function (resolve, reject) {
        con.query(
        "INSERT INTO DEPOSIT(user_id, deposit_amount, created_on, status) values(?, ?, NOW(), 1);",
        [user_id, deposit_amount],
        function (err, result, fields) {
            if (err) {
            return reject(err);
            }
            resolve(result);
        }
        );
    });
  }, 

  createDepositHistory : (deposit_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "INSERT INTO HISTORY(deposit_id) values(?);",
        [deposit_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  }, 

  createWithdraw : (user_id, withdraw_amount, message, status) => {
    return new Promise(function (resolve, reject) {
        con.query(
        "INSERT INTO WITHDRAW(user_id, withdraw_amount, created_on, message, status) values(?, ?, NOW(), ?, ?);",
        [user_id, withdraw_amount, message, status],
        function (err, result, fields) {
            if (err) {
            return reject(err);
            }
            resolve(result);
        }
        );
    });
  }, 

  createWithdrawHistory : (withdraw_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "INSERT INTO HISTORY(withdraw_id) values(?);",
        [withdraw_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  getTodayWithdrawQuantity : (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `SELECT * FROM WITHDRAW 
          WHERE DAY(DATE_ADD(NOW(), INTERVAL 7 HOUR)) = DAY(DATE_ADD(created_on, INTERVAL 7 HOUR)) AND user_id = ?`,
          [user_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  getWithdrawById: (trans_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `SELECT * FROM WITHDRAW 
          WHERE withdraw_id = ? and status = 0`, [trans_id], 
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  disapproveWithdrawById: (trans_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `UPDATE WITHDRAW SET status = -1 WHERE withdraw_id = ?`, [trans_id], 
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  approveWithdrawById: (trans_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `UPDATE WITHDRAW SET status = 1 WHERE withdraw_id = ?`, [trans_id], 
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
};
module.exports = TransactionService;
