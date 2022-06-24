var express = require("express");
const TransferService = require("../service/transfer.service");
const CardService = require("../service/card.service");
const {
    getNameByPhone,
    getEmailFromId,
    getBalanceFromId,
    getNameFromId,
    getPhoneFromId,
} = require("../service/user.service");
const {
    generateOTP,
  } = require("../service/authenticate.service.js");
const {
  getCurrentUser,
  getCurrentUserId,
  sendMail,
} = require("../utils");
var router = express.Router();

let listTransferOTP = []

/* GET moneyTransfer view */
router.get("/transfer", function (req, res, next) {
    res.render("transaction/moneyTransfer", {
        title: "Money Transfer",
        layout: "layouts/main",
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
    });
});

router.post("/getNameByPhone", async function (req, res, next) {
    let recipient_phone = req.body.recipient_phone
    let recipient_name = await getNameByPhone(recipient_phone)
    const user_id = getCurrentUserId(req);


    let recipient_id = await TransferService.findIdByPhone(recipient_phone)

    if(recipient_id && recipient_id[0] && recipient_id[0].user_id && recipient_id[0].user_id == user_id) {
        res.statusCode = 401
        res.json({message: "Không thể chuyển tiền cho chính mình"})
        return
    }

    if(!recipient_id || recipient_id.length < 1) {
        res.statusCode = 422;
        res.json({
            message: "Không tồn tại người dùng, vui lòng nhập lại số điện thoại",
        });
        return;
    }

    if(recipient_name.length == 0 || !recipient_name) {
        res.statusCode = 401;
        res.json({ message: "Không tồn tại người dùng có số điện thoại như trên" });
        return;
    } else {
        res.statusCode = 200;
        res.json({ message: "Success", name: recipient_name[0].name });
        return;
    }
});

/* POST moneyTransfer view. */
router.post("/transfer", async function (req, res, next) {
    const { recipient_phone, transfer_amount, fee, fee_bearer, message } = req.body;
    const total = req.body.transfer_total;
    const user_id = getCurrentUserId(req);

    if(!recipient_phone || !transfer_amount || !fee_bearer || !message || !fee) {
        res.statusCode = 422;
        res.json({ message: "Vui lòng điền đầy đủ thông tin" });
        return;
    }

    if(recipient_phone.length !== 10) {
        res.statusCode = 422;
        res.json({ message: "Số điện thoại gồm 10 chữ số" });
        return;
    }

    let isUserEnoughMoney;
    let isRecipientEnoughMoney;
    let recipient_id = await TransferService.findIdByPhone(recipient_phone)

    if(recipient_id && recipient_id[0] && recipient_id[0].user_id && recipient_id[0].user_id == user_id) {
        res.statusCode = 401
        res.json({message: "Không thể chuyển tiền cho chính mình"})
        return
    }

    if(!recipient_id || recipient_id.length < 1) {
        res.statusCode = 422;
        res.json({
            message: "Không tồn tại người dùng, vui lòng nhập lại số điện thoại",
        });
        return;
    }

    if (fee_bearer == 0) {
        isUserEnoughMoney = await CardService.valdateBalance(user_id, total)
        
        if(isUserEnoughMoney.length == 0 || !isUserEnoughMoney) {
            res.statusCode = 401
            res.json({message: "Không thể thực hiện giao dịch vì số dư của bạn đã không còn đủ"})
            return
        }
    } else {
        isUserEnoughMoney = await CardService.valdateBalance(user_id, transfer_amount )
        isRecipientEnoughMoney = await CardService.valdateBalance(recipient_id[0].user_id, fee )
        console.log(isRecipientEnoughMoney)
        console.log(isUserEnoughMoney)
        
        if(isUserEnoughMoney.length == 0 || !isUserEnoughMoney) {
            res.statusCode = 401
            res.json({message: "Không thể thực hiện giao dịch vì số dư của bạn đã không còn đủ"})
            return
        }

        if(isRecipientEnoughMoney.length == 0 || !isRecipientEnoughMoney) {
            res.statusCode = 401
            res.json({message: "Không thể thực hiện giao dịch vì số dư của người nhận đã không còn đủ"})
            return
        }
    }

    TransferService.findIdByPhone(recipient_phone)
        .then(async (row) => {
            if (!row || row.length < 1) {
                res.statusCode = 422;
                res.json({
                    message: "Không tồn tại người dùng, vui lòng nhập lại số điện thoại",
                });
                return;
            } else {
                let email = await getEmailFromId(user_id)
                email = email[0]['email']
                if (!email) {
                    res.statusCode = 500;
                    res.json({
                        message: `Không thể thực hiện giao dịch do lỗi email của bạn`,
                    });
                    return; 
                }
                const recipient_id = row[0]['user_id'];
                const OTP = generateOTP();
                const now = new Date();
                const expireDate = new Date(now.setMinutes(now.getMinutes() + 1))
                const email_content = `Bạn đã thực hiện giao dịch chuyển tiền trên PAYNET <br/> Mã OTP của bạn là: <b> ${OTP} </b> `;
                sendMail(email, `OTP chuyển tiền`, email_content)
                    .then(() => {
                        listTransferOTP.push({
                            user_id: user_id,
                            recipient_id: recipient_id,
                            transfer_amount: transfer_amount,
                            fee_bearer: fee_bearer,
                            fee: fee,
                            message: message,
                            total: total,
                            OTP: OTP,
                            expireDate: expireDate,
                            active: true,
                        });
                            res.statusCode = 200;
                            res.json({
                                message: "Success",
                                email: email,
                                expireDate: expireDate
                            });
                        return;
                    })
                    .catch((error) => {
                        console.log(error)
                        res.statusCode = 500;
                        res.json({
                            type: "text",
                            message: `Không thể gửi được email cho: ${email}`,
                        });
                        return; 
                    });
            }
        })
        .catch((error) => {
            console.log(error);
            res.statusCode = 500;
            res.json({ message: "Some thing went wrong, please check recipient's phone number" });
            return;
        });
})

router.post("/validate-otp", async function (req, res, next) {
    const { OTP, identity_time } = req.body;
    const identity = new Date(identity_time);
    const now = new Date();
    const user_id = getCurrentUserId(req);

    let isValidOTP = false;
    for (index in listTransferOTP) {
      const item = listTransferOTP[index];
      if (
        item.active &&
        item.OTP == OTP &&
        item.user_id == user_id &&
        item.expireDate.getTime() == identity.getTime() &&
        item.expireDate.getTime() >= now.getTime() 
      ) {
        isValidOTP = true;

        let success_message;
        let status;

        if (item.transfer_amount > 5000000) {
            success_message = "Do số tiền bạn chuyển lớn hơn 5,000,000 đồng nên giao dịch của bạn sẽ ở trạng thái đang chờ đến khi quản trị viên phê duyệt";
            status = 0
        } else {
            success_message = "Chuyển tiền thành công";
            status = 1
        }
        TransferService.createTransfer(user_id, item.recipient_id, item.transfer_amount, item.fee, item.fee_bearer, item.message, item.total)
        .then((data) => {
            if(data.affectedRows === 1) {
                let transfer_id = data["insertId"];
                TransferService.createTransferHistory(transfer_id)
                .then(async (result) => {
                    if(result.affectedRows === 1) {
                        res.statusCode = 200
                        res.json({message: success_message})
                        // Send mail to recipient
                        if (status && status === 1) {
                            let email = await getEmailFromId(item.recipient_id)
                            email = email[0]['email']
                            if (!email) {
                                console.error('Không thể gửi email cho người nhận vì không có email')
                                return; 
                            }
                            let balance = await getBalanceFromId(item.recipient_id)
                            balance = balance[0]['balance']
                            if (!balance) {
                                console.error('Không thể gửi email cho người nhận vì không có số dư')
                                return; 
                            }
                            let phone = await getPhoneFromId(user_id)
                            phone = phone[0]['phone']
                            if (!phone) {
                                console.error('Không thể gửi email cho người nhận vì không có số điện thoại')
                                return; 
                            }
                            let name = await getNameFromId(user_id)
                            name = name[0]['name']
                            if (!name) {
                                console.error('Không thể gửi email cho người nhận vì không có tên')
                                return; 
                            }
                            const email_content = `
                                Bạn đã nhận tiền từ:<b> ${name} </b><br/>
                                Có số điện thoại là:<b> ${phone} </b><br/>
                                Bạn nhận được số tiền:<b> ${parseInt(item.transfer_amount).toLocaleString('it-IT', {style: 'currency', currency: 'VND'})} </b><br/>
                                Với lời nhắn: <b> ${item.message} </b><br/>
                                ${item.fee_bearer == 1 ? 'Bạn là người chịu phí chuyển tiền: <b>' + parseInt(item.fee).toLocaleString('it-IT', {style: 'currency', currency: 'VND'}) + '</b><br/>':''}
                                Số dư sau khi nhận tiền của bạn là: <b> ${balance.toLocaleString('it-IT', {style: 'currency', currency: 'VND'})} </b> 
                            `;
                            
                            sendMail(email, `Thông báo biến động số dư`, email_content)
                                .catch((error) => {
                                    console.error(error)
                                    return; 
                                });
                        }
                        return
                    } else {
                        res.statusCode = 500;
                        res.json({ message: "Không thể tạo lịch sử chuyển tiền" });
                        return;
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.statusCode = 500;
                    res.json({ message: "Không thể tạo lịch sử chuyển tiền" });
                    return;
                });
            } else {
                res.statusCode = 500;
                res.json({ message: "Không thể chuyển tiền vui lòng liên hệ tổng đài để được hỗ trợ" });
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
    }
    if (!isValidOTP) {
      res.statusCode = 422;
      res.json({
        type: "text",
        message: `OTP không hợp lệ`,
      });
      return;
    }
});

router.post("/disapproveTransfer", async function (req, res, next) {
    let trans_id = req.body.trans_id
    let transfer = await TransferService.getTransferById(trans_id)
    if(transfer.length == 0 || !transfer) {
      res.statusCode = 401
      res.json({message: "Không tồn tại giao dịch"})
      return
    }
    TransferService.disapproveTransferById(trans_id)
    .then(rows => {
      if(rows.affectedRows === 1) {
        res.statusCode = 200
        res.json({message: "Success"})
        return
      } else {
        res.statusCode = 500
        res.json({message: "Không thể hủy giao dịch"})
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

router.post("/approveTransfer", async function (req, res, next) {
    let trans_id = req.body.trans_id
    let transfer = await TransferService.getTransferById(trans_id)
    if(transfer.length == 0 || !transfer) {
      res.statusCode = 401
      res.json({message: "Không tồn tại giao dịch"})
      return
    }
    let total = transfer[0].transfer_amount + transfer[0].fee 
    let isUserEnoughMoney;
    let isRecipientEnoughMoney;
    if (transfer[0].fee_bearer == 0) {
        isUserEnoughMoney = await CardService.valdateBalance(transfer[0].user_id, total)
        
        if(isUserEnoughMoney.length == 0 || !isUserEnoughMoney) {
            res.statusCode = 401
            res.json({message: "Bạn không thể chấp nhận giao dịch này vì số dư của người chuyển đã không còn đủ"})
            return
        }
    } else {
        isUserEnoughMoney = await CardService.valdateBalance(transfer[0].user_id, transfer[0].transfer_amount )
        isRecipientEnoughMoney = await CardService.valdateBalance(transfer[0].recipient_id, transfer[0].fee )
        
        if(isUserEnoughMoney.length == 0 || !isUserEnoughMoney) {
            res.statusCode = 401
            res.json({message: "Bạn không thể chấp nhận giao dịch này vì số dư của người chuyển đã không còn đủ"})
            return
        }

        if(isRecipientEnoughMoney.length == 0 || !isRecipientEnoughMoney) {
            res.statusCode = 401
            res.json({message: "Bạn không thể chấp nhận giao dịch này vì số dư của người nhận đã không còn đủ"})
            return
        }
    }

    TransferService.approveTransferById(trans_id)
    .then(async (rows) => {
      if(rows.affectedRows === 1) {
        res.statusCode = 200
        res.json({message: "Success"})
        // Send mail to recipient
        let email = await getEmailFromId(transfer[0].recipient_id)
        email = email[0]['email']
        if (!email) {
            console.error('Không thể gửi email cho người nhận vì không có email')
            return; 
        }
        let balance = await getBalanceFromId(transfer[0].recipient_id)
        balance = balance[0]['balance']
        if (!balance) {
            console.error('Không thể gửi email cho người nhận vì không có số dư')
            return; 
        }
        let phone = await getPhoneFromId(transfer[0].user_id)
        phone = phone[0]['phone']
        if (!phone) {
            console.error('Không thể gửi email cho người nhận vì không có số điện thoại')
            return; 
        }
        let name = await getNameFromId(transfer[0].user_id)
        name = name[0]['name']
        if (!name) {
            console.error('Không thể gửi email cho người nhận vì không có tên')
            return; 
        }
        const email_content = `
            Bạn đã nhận tiền từ:<b> ${name} </b><br/>
            Có số điện thoại là:<b> ${phone} </b><br/>
            Bạn nhận được số tiền:<b> ${transfer[0].transfer_amount} </b><br/>
            Với lời nhắn: <b> ${transfer[0].message} </b><br/>
            ${transfer[0].fee_bearer == 1 ? 'Bạn là người chịu phí chuyển tiền: <b>' + transfer[0].fee + '</b><br/>':''}
            Số dư sau khi nhận tiền của bạn là: <b> ${balance} </b> 
        `;
        
        sendMail(email, `Thông báo biến động số dư`, email_content)
            .catch((error) => {
                console.error(error)
                return; 
            });
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