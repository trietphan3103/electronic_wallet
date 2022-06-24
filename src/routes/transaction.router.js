var express = require("express");
const HistoryService = require("../service/history.service");
const CardService = require("../service/card.service");
const TransactionService = require("../service/transaction.service");
const UserService = require("../service/user.service.js");
var router = express.Router();
const { getCurrentUserId, getCurrentUser } = require("../utils.js");
/* GET confirmOTP view */
router.get("/confirmOTP", function (req, res, next) {
  res.render("transaction/confirmOTP", {
    title: "Confirm OTP",
    layout: "layouts/main",
  });
});

/* GET recharge view */
router.get("/recharge", function (req, res, next) {
  const user_id = getCurrentUserId(req);
  UserService.getCurrentUserDetail(user_id).then((rows) => {
    res.render("transaction/recharge", {
      title: "Recharge",
      layout: "layouts/main",
      user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      user_detail: rows[0]
    });
  });
});

/* POST to recharge money to account */
router.post("/recharge", function (req, res, next) {
  let card_number = req.body.card_number
  let exp_date = req.body.exp_date
  let cvv = req.body.cvv
  let amount_of_money = req.body.amount_of_money

  const listCard = [
    {
      card_number: "111111",
      exp_date: "10/10/2022",
      cvv: "411"
    },
    {
      card_number: "222222",
      exp_date: "11/11/2022",
      cvv: "443"
    },
    {
      card_number: "333333",
      exp_date: "12/12/2022",
      cvv: "577"
    }
  ]

  if(!card_number || !exp_date || !cvv || !amount_of_money) {
    res.statusCode = 422
    res.json({message: "Vui lòng nhập đầy đủ thông tin"})
    return
  }

  if(card_number.length !== 6 ) {
    res.statusCode = 422
    res.json({message: "Số thẻ gồm 6 chữ số"})
    return
  }

  if(cvv.length !== 3 ) {
    res.statusCode = 422
    res.json({message: "Mã CVV gồm 3 chữ số"})
    return
  }

  let valid_card_number = false
  let valid_exp_date = false
  let valid_cvv = false
  for(const card of listCard) {
    if(card_number === card.card_number) {
      valid_card_number = true
      let d = new Date(exp_date)
      let dateString = d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear()
      if(dateString === card.exp_date) {
        valid_exp_date = true
        if(cvv === card.cvv) {
          valid_cvv = true
        }
      }
    }
  }
  if (!valid_card_number) {
    res.statusCode = 422
    res.json({message: "Thẻ này không được hỗ trợ"})
    return
  }

  if (!valid_exp_date) {
    res.statusCode = 422
    res.json({message: "Ngày hết hạn không đúng"})
    return
  }

  if (!valid_cvv) {
    res.statusCode = 422
    res.json({message: "Mã CVV không đúng"})
    return
  }

  if (card_number === "333333") {
    res.statusCode = 422
    res.json({message: "Thẻ hết tiền"})
    return
  }

  if (card_number === "222222" && amount_of_money > 1000000) {
    res.statusCode = 422
    res.json({message: "Thẻ này chỉ rút được tối đa 1 triệu/lần"})
    return
  } 

  let user_id = getCurrentUserId(req)
  TransactionService.createDeposit(user_id, amount_of_money)
    .then((rows) => {
      if(rows.affectedRows === 1) {
        let deposit_id = rows["insertId"]
        TransactionService.createDepositHistory(deposit_id)
          .then((result) => {
            if(result.affectedRows === 1) {
              res.statusCode = 200
              res.json({message: "Success"})
              return
            } else {
              res.statusCode = 500;
              res.json({ message: "Không thể tạo lịch sử nạp tiền" });
              return;
            }
          })
          .catch((error) => {
            console.log(error);
            res.statusCode = 500;
            res.json({ message: "Không thể tạo lịch sử nạp tiền" });
            return;
          });
      
      } else {
        res.statusCode = 500;
        res.json({ message: "Không thể nạp tiền vui lòng liên hệ tổng đài để được hỗ trợ" });
        return;
      }
    })
    .catch((error) => {
      console.log(error);
      res.statusCode = 500;
      res.json({ message: "Some thing went wrong" });
      return;
    });


});

/* GET transactionHistory view. */
router.get("/transaction-history", function (req, res, next) {
  HistoryService.getHistoryList(getCurrentUserId(req)).then((rows) => {
    for(var i=0; i<rows.length; i++) {
      rows[i].HISTORY_TOTAL = rows[i].HISTORY_TOTAL.toLocaleString('it-IT', {style: 'currency', currency: 'VND'})
    }
    res.render("transaction/transactionHistory", {
      title: "Transaction History",
      layout: "layouts/main",
      user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      historyList: rows,
    });
  });
});

router.get("/list-transaction-history", function (req, res, next) {
  HistoryService.getHistoryList(
    req.query.user_id ?? -1
  )
    .then((rows) => {
      for(var i=0; i<rows.length; i++) {
        rows[i].HISTORY_TOTAL = rows[i].HISTORY_TOTAL.toLocaleString('it-IT', {style: 'currency', currency: 'VND'})
      }
      res.statusCode = 200;
      res.json(rows);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.statusCode = 500;
      res.json({message: "Something went wrong"});
      return;
    });
});

router.get("/listWaitingTransaction", async function (req, res, next) {
    HistoryService.getMoreFiveMillionHistoryList(getCurrentUserId(req)).then((rows) => {
      res.render("transaction/listWaitingTransaction", {
        title: "List Waiting Transaction",
        layout: "layouts/main",
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
        historyList: rows,
      });
    });
})

/* GET history buy card detail. */
router.get("/buy-card", function (req, res, next) {
  HistoryService.getHistoryBuyMobileCardDetail(
    req.query.history_id ?? -1,
    req.query.buycard_id ?? -1,
    req.query.user_id ?? getCurrentUserId(req)
  )
    .then((rows) => {
      res.statusCode = 200;
      res.json(rows);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.statusCode = 500;
      res.json({message: "Something went wrong"});
      return;
    });
});

/* GET history withdraw detail. */
router.get("/withdraw-detail", function (req, res, next) {
  HistoryService.getWithdrawHistoryDetail(
    req.query.history_id ?? -1,
    req.query.withdraw_id ?? -1,
    req.query.user_id ?? getCurrentUserId(req)
  )
    .then((rows) => {
      res.statusCode = 200;
      res.json(rows);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.statusCode = 500;
      res.json({message: "Something went wrong"});
      return;
    });
});

/* GET history deposit detail. */
router.get("/deposit", function (req, res, next) {
  HistoryService.getDepositHistoryDetail(
    req.query.history_id ?? -1,
    req.query.deposit_id ?? -1,
    req.query.user_id ?? getCurrentUserId(req)
  )
  .then((rows) => {
    res.statusCode = 200;
    res.json(rows);
    return;
  })
  .catch((error) => {
    console.log(error);
    res.statusCode = 500;
    res.json({message: "Something went wrong"});
    return;
  });
});

/* GET history transfer detail. */
router.get("/transfer", function (req, res, next) {
  HistoryService.getHistoryTransferDetail(
    req.query.transfer_id ?? -1,
    req.query.user_id ?? getCurrentUserId(req)
  )
  .then((rows) => {
    res.statusCode = 200;
    res.json(rows);
    return;
  })
  .catch((error) => {
    console.log(error);
    res.statusCode = 500;
    res.json({message: "Something went wrong"});
    return;
  });
});

/* GET withdraw view. */
router.get("/withdraw", function (req, res, next) {
  const user_id = getCurrentUserId(req);
  UserService.getCurrentUserDetail(user_id).then((rows) => {
    res.render("transaction/withdraw", {
      title: "Withdraw",
      layout: "layouts/main",
      user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      user_detail: rows[0]
    });
  });
});

router.post("/withdraw", function (req, res, next) {
  let card_number = req.body.card_number
  let exp_date = req.body.exp_date
  let cvv = req.body.cvv
  let withdraw_amount = req.body.withdraw_amount
  let message = req.body.message[0]
  let total = req.body.total
  const listCard = [
    {
      card_number: "111111",
      exp_date: "10/10/2022",
      cvv: "411"
    },
    {
      card_number: "222222",
      exp_date: "11/11/2022",
      cvv: "443"
    },
    {
      card_number: "333333",
      exp_date: "12/12/2022",
      cvv: "577"
    }
  ]

  if(!card_number || !exp_date || !cvv || !withdraw_amount) {
    res.statusCode = 422
    res.json({message: "Vui lòng nhập đầy đủ thông tin"})
    return
  }

  if(card_number.length !== 6 ) {
    res.statusCode = 422
    res.json({message: "Số thẻ gồm 6 chữ số"})
    return
  }

  if(cvv.length !== 3 ) {
    res.statusCode = 422
    res.json({message: "Mã CVV gồm 3 chữ số"})
    return
  }

  let valid_card_number = false
  let valid_exp_date = false
  let valid_cvv = false
  for(const card of listCard) {
    if(card_number === card.card_number) {
      valid_card_number = true
      let d = new Date(exp_date)
      let dateString = d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear()
      if(dateString === card.exp_date) {
        valid_exp_date = true
        if(cvv === card.cvv) {
          valid_cvv = true
        }
      }
    }
  }
  if (!valid_card_number) {
    res.statusCode = 422
    res.json({message: "Thông tin thẻ không hợp lệ"})
    return
  }

  if (!valid_exp_date) {
    res.statusCode = 422
    res.json({message: "Ngày hết hạn không đúng"})
    return
  }

  if (!valid_cvv) {
    res.statusCode = 422
    res.json({message: "Mã CVV không đúng"})
    return
  }

  if (card_number !== "111111") {
    res.statusCode = 422
    res.json({message: "Thẻ này không hỗ trợ để rút tiền"})
    return
  }

  if (parseInt(withdraw_amount) % 50000 !== 0) {
    res.statusCode = 422
    res.json({message: "Số tiền mỗi lần rút phải là bội số của 50,000 đồng"})
    return
  }

  let user_id = getCurrentUserId(req)
  let status;
  let success_message

  if (withdraw_amount > 5000000) {
    success_message = "Do số tiền bạn rút lớn hơn 5,000,000 đồng nên giao dịch của bạn sẽ ở trạng thái đang chờ đến khi quản trị viên phê duyệt"
    status = 0
  } else {
    success_message = "Rút tiền thành công"
    status = 1
  }

  TransactionService.getTodayWithdrawQuantity(getCurrentUserId(req))
  .then((results) => {
    if(results.length >= 2) {
      res.statusCode = 422;
      res.json({ message: "Số lần rút tiền tối đa trong ngày là 2 lần" });
      return;
    } else {
      CardService.valdateBalance(user_id, total)
      .then((row) => {
        if (!row || row.length < 1) {
          res.statusCode = 422;
          res.json({
            message: "Số dư của bạn không đủ để thực hiện thao tác này",
          });
          return;
        } else {
          TransactionService.createWithdraw(user_id, withdraw_amount, message, status)
            .then((rows) => {
              if(rows.affectedRows === 1) {
                let  withdraw_id = rows["insertId"]
                TransactionService.createWithdrawHistory( withdraw_id)
                  .then((result) => {
                    if(result.affectedRows === 1) {
                      res.statusCode = 200
                      res.json({message: success_message})
                      return
                    } else {
                      res.statusCode = 500;
                      res.json({ message: "Không thể tạo lịch sử rút tiền" });
                      return;
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                    res.statusCode = 500;
                    res.json({ message: "Không thể tạo lịch sử rút tiền" });
                    return;
                  });
              
              } else {
                res.statusCode = 500;
                res.json({ message: "Không thể rút tiền vui lòng liên hệ tổng đài để được hỗ trợ" });
                return;
              }
            })
            .catch((error) => {
              console.log(error);
              res.statusCode = 500;
              res.json({ message: "Some thing went wrong" });
              return;
            });
        }
      })
      .catch((error) => {
        console.log(error);
        res.statusCode = 500;
        res.json({ message: "Some thing went wrong on check user balance" });
        return;
      });
    }
  })
  .catch((error) => {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: "Some thing went wrong on get quantity of withdraw today" });
    return;
  });

});

router.post("/disapproveWithdraw", async function (req, res, next) {
  let trans_id = req.body.trans_id
  let withdraw = await TransactionService.getWithdrawById(trans_id)
  if(withdraw.length == 0 || !withdraw) {
    res.statusCode = 401
    res.json({message: "Không tồn tại giao dịch"})
    return
  }
  TransactionService.disapproveWithdrawById(trans_id)
  .then(rows => {
    if(rows.affectedRows === 1) {
      res.statusCode = 200
      res.json({message: "Success"})
      return
    } else {
      res.statusCode = 500
      res.json({message: "Không thể update giao dịch"})
      return
    }
  })
  .catch(error => {
    console.log(error)
    res.statusCode = 500
    res.json({message: error})
    return
  })
});

router.post("/approveWithdraw", async function (req, res, next) {
  let trans_id = req.body.trans_id
  let withdraw = await TransactionService.getWithdrawById(trans_id)
  if(withdraw.length == 0 || !withdraw) {
    res.statusCode = 401
    res.json({message: "Không tồn tại giao dịch"})
    return
  }
  let total = withdraw[0].withdraw_amount + withdraw[0].fee 

  let isEnoughMoney = await CardService.valdateBalance(withdraw[0].user_id, total)
  if(isEnoughMoney.length == 0 || !isEnoughMoney) {
    res.statusCode = 401
    res.json({message: "Bạn không thể chấp nhận giao dịch này vì số dư của người dùng đã không còn đủ"})
    return
  }
  TransactionService.approveWithdrawById(trans_id)
  .then(rows => {
    if(rows.affectedRows === 1) {
      res.statusCode = 200
      res.json({message: "Success"})
      return
    } else {
      res.statusCode = 500
      res.json({message: "Không thể xác nhận giao dịch"})
      return
    }
  })
  .catch(error => {
    console.log(error)
    res.statusCode = 500
    res.json({message: error})
    return
  })
});
module.exports = router;
