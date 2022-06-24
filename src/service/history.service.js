const con = require("../connection.js");

const HistoryService = {
  getHistoryList: (user_id) => {
    /*
        TYPE document: 
        1 -> Nạp tiền, 
        2 -> Rút tiền, 
        3 -> Chuyển tiền, 
        4 -> Mua thẻ điện thoại, 
        -1 -> UNKNOW
    */
    const queryStr = 
    `select * from (
        select (CASE 
                    WHEN HISTORY.deposit_id is not null THEN 1 
                    WHEN HISTORY.withdraw_id is not null THEN 2
                    WHEN HISTORY.transfer_id is not null THEN 3 
                    WHEN HISTORY.buy_card_id is not null THEN 4
                ELSE '' END) as TYPE,
                (CASE 
                    WHEN HISTORY.deposit_id is not null THEN DEPOSIT.deposit_id 
                    WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.withdraw_id
                    WHEN HISTORY.transfer_id is not null THEN TRANSFER.transfer_id
                    WHEN HISTORY.buy_card_id is not null THEN BUYING_MOBILE_CARD.buy_id
                ELSE '' END) as TRANSACTION_ID,
                (CASE 
                    WHEN HISTORY.deposit_id is not null THEN DEPOSIT.status 
                    WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.status 
                    WHEN HISTORY.transfer_id is not null THEN TRANSFER.status 
                    WHEN buy_card_id is not null THEN 1
                ELSE -1 END) AS HISTORY_STATUS,
                (CASE 
                    WHEN HISTORY.deposit_id is not null THEN DEPOSIT.deposit_amount 
                    WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.withdraw_amount 
                    WHEN HISTORY.transfer_id is not null THEN TRANSFER.transfer_amount 
                    WHEN HISTORY.buy_card_id is not null THEN BUYING_MOBILE_CARD.total
                ELSE -1 END) AS HISTORY_TOTAL,
                (CASE 
                    WHEN HISTORY.deposit_id is not null THEN DEPOSIT.user_id 
                    WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.user_id 
                    WHEN HISTORY.transfer_id is not null THEN TRANSFER.user_id 
                    WHEN HISTORY.buy_card_id is not null THEN BUYING_MOBILE_CARD.user_id
                ELSE '' END) as USER_ID,
                TRANSFER.recipient_id as RECIPIENT_ID,
                HISTORY.history_id as HISTORY_ID,
                HISTORY.time_create as CREATED_ON 
        from HISTORY
        LEFT JOIN DEPOSIT on DEPOSIT.deposit_id = HISTORY.deposit_id
        LEFT JOIN WITHDRAW on WITHDRAW.withdraw_id = HISTORY.withdraw_id
        LEFT JOIN TRANSFER on ((TRANSFER.transfer_id = HISTORY.transfer_id and TRANSFER.user_id = ?) or (TRANSFER.recipient_id = ? and TRANSFER.status = 1))
        LEFT JOIN BUYING_MOBILE_CARD on BUYING_MOBILE_CARD.buy_id = HISTORY.buy_card_id
    ) HISTORY_PAYLOAD
    where user_id = ? or (type = 3 and recipient_id = ?) order by created_on desc;`;

    return new Promise(function (resolve, reject) {
      con.query(queryStr, [user_id, user_id, user_id, user_id], function (err, result, fields) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  getMoreFiveMillionHistoryList: () => {
    /*
        TYPE document: 
        1 -> Nạp tiền, 
        2 -> Rút tiền, 
        3 -> Chuyển tiền, 
        4 -> Mua thẻ điện thoại, 
        -1 -> UNKNOW
    */
    const queryStr = 
    `select (CASE 
              WHEN HISTORY.withdraw_id is not null THEN 2
              WHEN HISTORY.transfer_id is not null THEN 3 
            ELSE '' END) as TYPE,
            (CASE 
              WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.withdraw_id
              WHEN HISTORY.transfer_id is not null THEN TRANSFER.transfer_id
            ELSE '' END) as TRANSACTION_ID,
                (CASE 
              WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.status 
              WHEN HISTORY.transfer_id is not null THEN TRANSFER.status 
            ELSE -1 END) AS HISTORY_STATUS,
                (CASE 
              WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.withdraw_amount 
              WHEN HISTORY.transfer_id is not null THEN TRANSFER.transfer_amount 
            ELSE -1 END) AS HISTORY_TOTAL,
                (CASE 
              WHEN HISTORY.withdraw_id is not null THEN WITHDRAW.user_id 
              WHEN HISTORY.transfer_id is not null THEN TRANSFER.user_id 
            ELSE '' END) as USER_ID,
                TRANSFER.recipient_id as RECIPIENT_ID,
            HISTORY.history_id as HISTORY_ID,
            HISTORY.time_create as CREATED_ON 
    from HISTORY
    LEFT JOIN WITHDRAW on WITHDRAW.withdraw_id = HISTORY.withdraw_id
    LEFT JOIN TRANSFER on TRANSFER.transfer_id = HISTORY.transfer_id
    where WITHDRAW.status = 0 or TRANSFER.status = 0
    order by created_on desc;`;

    return new Promise(function (resolve, reject) {
      con.query(queryStr, function (err, result, fields) {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  getHistoryTransferDetail: (transfer_id, user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
          `select TRANSFER.*, 
                  USERS.*, 
                  TRANSFER.status as TRANSFER_STATUS,
                  (select usr.user_name from USERS usr where usr.user_id = TRANSFER.recipient_id) as recipient_name,
                  (select usr.phone from USERS usr where usr.user_id = TRANSFER.recipient_id) as recipient_phone
          from TRANSFER JOIN USERS ON TRANSFER.user_id = USERS.user_id
          WHERE (USERS.user_id = ? or (TRANSFER.recipient_id = ? and TRANSFER.status = 1)) and TRANSFER.transfer_id = ?;`,
        [ user_id, user_id, transfer_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  getHistoryBuyMobileCardDetail: (history_id, buy_card_id, user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        ` select * from HISTORY, BUYING_MOBILE_CARD 
          where HISTORY.buy_card_id = BUYING_MOBILE_CARD.buy_id 
              and HISTORY.history_id = ? 
              and BUYING_MOBILE_CARD.buy_id = ?
              and BUYING_MOBILE_CARD.user_id = ?;`,
        [history_id, buy_card_id, user_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  getWithdrawHistoryDetail: (history_id, withdraw_id, user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        ` select * from HISTORY, WITHDRAW 
          where HISTORY.withdraw_id = WITHDRAW.withdraw_id 
              and HISTORY.history_id = ? 
              and WITHDRAW.withdraw_id = ?
              and WITHDRAW.user_id = ?;`,
        [history_id, withdraw_id, user_id],
        function (err, result, fields) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
  getDepositHistoryDetail: (history_id, deposit_id, user_id) => {
    return new Promise(function (resolve, reject) {
      con.query(
        ` select * from HISTORY, DEPOSIT 
          where HISTORY.deposit_id = DEPOSIT.deposit_id 
              and HISTORY.history_id = ? 
              and DEPOSIT.deposit_id = ?
              and DEPOSIT.user_id = ?;`,
        [history_id, deposit_id, user_id],
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

module.exports = HistoryService;
