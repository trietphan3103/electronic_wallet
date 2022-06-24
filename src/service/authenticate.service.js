const con = require("../connection.js");

const AuthenticateService = {
  validateLogin: (username, password) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS where user_name = ? and password = ?",
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

  getUserByUsername: (username) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS where user_name = ?",
        [username],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  validateAccountBlocked: (username) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS where user_name = ? and (time_block_account is null or time_block_account < now()) and unsafe_login < 2",
        [username],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  updateUserFailedLogin: (username) => {
    return new Promise(function (resolve, reject) {
      con.query(
        `update USERS SET 
          failed_login_count = (CASE WHEN (time_block_account < now() or time_block_account is null) THEN failed_login_count + 1 ELSE failed_login_count END) , 
          unsafe_login = (CASE WHEN failed_login_count >= 3 THEN unsafe_login + 1 ELSE unsafe_login END),
          time_block_account = (CASE WHEN (failed_login_count >= 3 and (time_block_account < now() or time_block_account is null)) THEN DATE_ADD(now(), INTERVAL 1 minute) WHEN unsafe_login >= 2 then now() ELSE time_block_account END),
          failed_login_count = (CASE WHEN failed_login_count >= 3 THEN 0 ELSE failed_login_count END)
        where user_name = ? and user_name != 'admin'`,
        [username],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  validateDisableAccount: (username) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS where user_name = ? and unsafe_login >= 2",
        [username],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  getAllUserName: () => {
    return new Promise(function (resolve, reject) {
      con.query("SELECT * FROM USERS", [], function (err, result, fields) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  checkPhoneExist: (phone) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS where phone = ?",
        [phone],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  checkEmailExist: (email) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS where email = ?",
        [email],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  signup: (username, password, name, birthday, phone, address, email, id_card_front, id_card_behind) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "INSERT INTO USERS(user_name, password, name, dob, phone, address, email, id_card_front, id_card_behind) values(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [username, password, name, birthday, phone, address, email, id_card_front, id_card_behind],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  changePassword: (username, hashedPassword, newHashedPassword) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "UPDATE USERS SET password = ?, first_login = 0 where user_name = ? and password = ?",
        [newHashedPassword, username, hashedPassword],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  forgetPassword: (email, newHashedPassword) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "UPDATE USERS SET password = ?, first_login = 0 where email = ?",
        [newHashedPassword, email],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  updateLoginSuccess: (username) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "UPDATE USERS SET failed_login_count = 0, unsafe_login = 0, time_block_account = null where user_name = ?",
        [username],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },

  generateUserName: () => {
    let newUsername = "";
    for (let i = 0; i < 10; i++) {
      newUsername += (Math.floor(Math.random() * 9) + 1).toString();
    }
    return newUsername;
  },

  validateUserName: (username, rows) => {
    for (item in rows) {
      if (username === item["user_name"]) {
        return false;
      }
    }
    return true;
  },

  generatePassword: () => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateOTP: () => {
    var result = "";
    var characters = "0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
};

module.exports = AuthenticateService;
