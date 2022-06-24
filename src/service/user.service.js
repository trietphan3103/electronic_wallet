const con = require("../connection.js");
const Middleware = require("../middleware");
const { getCurrentUserId } = require("../utils.js");

const UserService = {
  getUserList: () => {
    return new Promise(function (resolve, reject) {
      con.query("SELECT * FROM USERS", function (err, result, fields) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  getCurrentUserDetail: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query("SELECT * FROM USERS where user_id = ?", [user_id], function (err, result, fields) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  addUser: (username, password) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "INSERT INTO USERS (user_name, password) VALUES (?, ?)",
        [username, password],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  changePasswordByMail:(email, password) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "UPDATE USERS SET password = ? WHERE email = ?",
        [password, email],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  getNameByPhone: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT USERS.name FROM USERS WHERE phone = ?",
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
  getEmailFromId: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT USERS.email FROM USERS WHERE user_id = ?",
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
  getBalanceFromId: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT USERS.balance FROM USERS WHERE user_id = ?",
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
  getPhoneFromId: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT USERS.phone FROM USERS WHERE user_id = ?",
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
  getNameFromId: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT USERS.name FROM USERS WHERE user_id = ?",
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
  checkAdmin: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `SELECT * FROM USERS WHERE user_id = ? and user_name = 'admin'`,
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
  checkActive: (user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `SELECT * FROM USERS WHERE (user_id = ? and status = 2)`,
        [user_id, user_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  }
};
module.exports = UserService;
