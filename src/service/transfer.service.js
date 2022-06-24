const con = require("../connection.js");
const Middleware = require("../middleware");

const TransferService = {
    createTransfer: (user_id, recipient_id, transfer_amount, fee, fee_bearer, message, total) => {
        return new Promise(function (resolve, reject) {
            con.query(
                "INSERT INTO TRANSFER(user_id, recipient_id, transfer_amount, fee, fee_bearer, message, total, created_on) VALUE (?, ?, ?, ?, ?, ?, ?, NOW())",
                [user_id, recipient_id, transfer_amount, fee, fee_bearer, message, total],
                function (err, result, fields) {
                    if (err) {
                      return reject(err);
                    }
                    resolve(result);
                }
            );
        });
    },

    createTransferHistory: (transfer_id, note) => {
        return new Promise(function (resolve, reject) {
            con.query(
                "INSERT INTO HISTORY(transfer_id, note) values(?, ?);",
                [transfer_id, note],
                function (err, result, fields) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                }
            );
        });
    },

    findIdByPhone: (recipient_phone) => {
        return new Promise(function (resolve, reject) {
            con.query("SELECT USERS.user_id FROM USERS WHERE phone = ?", [recipient_phone],
                function (err, result, fields) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                }
            );
        });
    },

    createTransferHistory : (transfer_id) => {
        return new Promise(function (resolve, reject) {
            con.query(
                "INSERT INTO HISTORY(transfer_id) values(?);",
                [transfer_id],
                function (err, result, fields) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                }
            );
        });
    },

    getTransferById : (trans_id) => {
        return new Promise(function (resolve, reject) {
            con.query(
                "SELECT * FROM TRANSFER WHERE transfer_id = ? and status = 0",
                [trans_id],
                function (err, result, fields) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                }
            );
        });
    },

    disapproveTransferById: (trans_id) => {
        return new Promise(function (resolve, reject) {
          con.query(
            `UPDATE TRANSFER SET status = -1 WHERE transfer_id = ?`, [trans_id], 
            function (err, result, fields) {
              if (err) {
                return reject(err);
              }
              resolve(result);
            }
          );
        });
    },
    approveTransferById: (trans_id) => {
        return new Promise(function (resolve, reject) {
          con.query(
            `UPDATE TRANSFER SET status = 1 WHERE transfer_id = ?`, [trans_id], 
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
module.exports = TransferService;