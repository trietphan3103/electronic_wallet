const con = require("../connection.js");
const Middleware = require('../middleware');

const AccountService = {
  getUserListActivatedAccount : () => {
    return new Promise(function(resolve, reject) {
      con.query("SELECT * FROM USERS WHERE (unsafe_login < 2) and status = 2 and user_name != 'admin' order by created_on desc", function (err, result, fields) {
          if (err) {
              return reject(err);
          }
          resolve(result);
      });
    });
  },

  getUserListDisabledAccount : () => {
    return new Promise(function(resolve, reject) {
      con.query("SELECT * FROM USERS WHERE status = -1 and unsafe_login < 2 order by created_on desc", function (err, result, fields) {
          if (err) {
              return reject(err);
          }
          resolve(result);
      });
    });
  },

  getUserListLockedAccount: () => {
    return new Promise(function(resolve, reject) {
      con.query("SELECT * FROM USERS WHERE (unsafe_login >= 2) and user_name != 'admin' order by time_block_account desc", function (err, result, fields) {
          if (err) {
              return reject(err);
          }
          resolve(result);
      });
    });
  },

  getUserListWaitingAccount : () => {
    return new Promise(function(resolve, reject) {
      con.query(`SELECT * FROM USERS WHERE unsafe_login < 2 and status = 0 and user_name != 'admin' order by time_create_status desc`, function (err, result, fields) {
          if (err) {
              return reject(err);
          }
          resolve(result);
      });
    });
  },

  activateAccount : (id) => {
    return new Promise(function(resolve, reject) {
      con.query(`UPDATE USERS SET status = 2 WHERE user_id = ?`, [id], function(err, result, fields) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  disableAccount : (id) => {
    return new Promise(function(resolve, reject) {
      con.query(`UPDATE USERS SET status = -1 WHERE user_id = ?`, [id], function(err, result, fields) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  requestAccountToUpdate : (id) => {
    return new Promise(function(resolve, reject) {
      con.query(`UPDATE USERS SET status = 1 WHERE user_id = ?`, [id], function(err, result, fields) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  checkExistAccount : (id) => {
    return new Promise(function(resolve, reject) {
      con.query(`SELECT * FROM USERS WHERE user_id = ?`, [id], function(err, result, fields) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  unlockAccount : (id) => {
    return new Promise(function(resolve, reject) {
      con.query(`UPDATE USERS SET time_block_account = NULL
                ,active = 1, failed_login_count = 0, unsafe_login = 0
                WHERE user_id = ?`, [id], function(err, result, fields) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  updateIdCard : (id_card_front, id_card_behind, id) => {
    return new Promise(function(resolve, reject) {
      con.query(`UPDATE USERS SET id_card_front = ?
                ,id_card_behind = ?, status = 0, time_create_status = NOW()
                WHERE user_id = ?`, [id_card_front, id_card_behind, id], function(err, result, fields) {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },
}

module.exports = AccountService;