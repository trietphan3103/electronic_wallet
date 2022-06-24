var express = require("express");
const CardService = require("../service/card.service");
const {
  getCurrentUser,
  getCurrentUserId,
  generateToken,
  generateNewNumberString,
  getLastInsertId,
} = require("../utils");
var router = express.Router();

/* GET buyCard view. */
router.get("/buy-card", function (req, res, next) {
  res.render("card/buyCard", {
    title: "Buy Card",
    layout: "layouts/main",
    user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
  });
});

/* POST buyCard view. */
router.post("/buy-card", function (req, res, next) {
  const { network_id, quantity, denomination } = req.body;

  if (!network_id || !quantity || !denomination) {
    res.statusCode = 422;
    res.json({ message: "Vui lòng điền đầy đủ thông tin" });
    return;
  }

  const total = quantity * denomination;
  const user_id = getCurrentUserId(req);

  CardService.valdateBalance(user_id, total)
    .then((rows) => {
      if (!rows || rows.length < 1) {
        res.statusCode = 422;
        res.json({
          message: "Số dư của bạn không đủ để thực hiện thao tác này",
        });
        return;
      } else {
        CardService.buyCard(network_id, user_id, quantity, denomination, total)
          .then((rows) => {
            const cardList = [];
            for (let i = 0; i < quantity; i++) {
              let newCardNumber = generateNewNumberString(5);

              // Check if new number has existed in arr
              while (
                cardList.filter((val) => {
                  return newCardNumber === val.card_postfix;
                }).length > 0
              ) {
                newCardNumber = generateNewNumberString(5);
              }

              cardList.push({
                card_postfix: newCardNumber,
                card_number: network_id + newCardNumber,
                network_name: CardService.getNetworkName(network_id),
                denomination: denomination,
              });
            }
            CardService.createHistory(
              rows["insertId"],
              JSON.stringify(cardList)
            )
              .then(() => {})
              .catch((error) => {
                console.log(error);
              })
              .finally(() => {
                res.statusCode = 200;
                res.json({ message: "success", cardList: cardList });
                return;
              });
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
      res.json({ message: "Some thing went wrong" });
      return;
    });
});

/* GET buyCardSuccess view */
router.get("/buyCardSuccess", function (req, res, next) {
  res.render("card/buyCardSuccess", {
    title: "Buy Card Success",
    layout: "layouts/main",
  });
});

module.exports = router;
