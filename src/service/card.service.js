const con = require("../connection.js");
const Middleware = require("../middleware");
const { getCurrentUserId } = require("../utils.js");

const CardService = {
  buyCard: (network_id, user_id, quantity, denomination, total) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "INSERT INTO BUYING_MOBILE_CARD(network_id, user_id, quantity, denomination, total) values(?, ?, ?, ?, ?);",
        [network_id, user_id, quantity, denomination, total],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  createHistory: (buy_card_id, note) => {
    return new Promise(function (resolve, reject) {
        con.query(
          "INSERT INTO HISTORY(buy_card_id, note) values(?, ?);",
          [buy_card_id, note],
          function (err, result, fields) {
            if (err) {
              return reject(err);
            }
            resolve(result);
          }
        );
      });
  },
  valdateBalance: (user_id, total) => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT * FROM USERS WHERE user_id = ? and balance >= ?",
        [user_id, total],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  getNetworkName: (network_id) => {
    switch (network_id) {
      case 11111:
      case "11111":
        return "Viettel";
      case 22222:
      case "22222":
        return "Mobifone";
      case 33333:
      case "33333":
        return "Vinaphone";
      default:
        return "Unknow network";
    }
  },
};
module.exports = CardService;
