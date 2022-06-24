var express = require("express");
const AccountService = require("../service/account.service");
const { getCurrentUser } = require("../utils");
var router = express.Router();

/* GET listActivatedAccount view. */
router.get("/listActivatedAccount", async function (req, res, next) {
  AccountService.getUserListActivatedAccount()
    .then(function (rows) {
      res.render("account/listActivatedAccount", {
        title: "List activated Account",
        layout: "layouts/main",
        account: rows,
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      });
    })
    .catch((err) =>
      setImmediate(() => {
        throw err;
      })
    );
});

/* GET listDisabledAccount view. */
router.get("/listDisabledAccount", async function (req, res, next) {
  AccountService.getUserListDisabledAccount()
    .then(function (rows) {
      res.render("account/listDisabledAccount", {
        title: "List disabled Account",
        layout: "layouts/main",
        account: rows,
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      });
    })
    .catch((err) =>
      setImmediate(() => {
        throw err;
      })
    );
});

/* GET listLockedAccount view. */
router.get("/listLockedAccount", async function (req, res, next) {
  AccountService.getUserListLockedAccount()
    .then(function (rows) {
      res.render("account/listLockedAccount", {
        title: "List blocked account",
        layout: "layouts/main",
        account: rows,
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      });
    })
    .catch((err) =>
      setImmediate(() => {
        throw err;
      })
    );
});

/* GET listWaitingAccount view. */
router.get("/listWaitingAccount", async function (req, res, next) {
  AccountService.getUserListWaitingAccount()
    .then(function (rows) {
      res.render("account/listWaitingAccount", {
        title: "List waiting account",
        layout: "layouts/main",
        account: rows,
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      });
    })
    .catch((err) =>
      setImmediate(() => {
        throw err;
      })
    );
});

router.post("/activate", function(req, res, next) {
  let id = req.body.id
  if(!id) {
    res.statusCode = 422
    res.json({message: "You didn't send user id"})
    return
  }

  AccountService.checkExistAccount(id)
    .then(function (rows) {
      if (rows.length == 0) {
        res.statusCode = 422
        res.json({message: "Id you sent is not exist"})
        return
      } else {
        AccountService.activateAccount(id)
          .then(function (rows) {
            if (rows.affectedRows === 1) {
              res.statusCode = 200
              res.json({message: "Success"})
            } else {
              res.statusCode = 500
              res.json({message: "Can not activate"})
            }
            return
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({ message: "Some thing went wrong" });
            return;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Some thing went wrong" });
      return;
    });
})

router.post("/requestUpdate", function(req, res, next) {
  let id = req.body.id
  if(!id) {
    res.statusCode = 422
    res.json({message: "You didn't send user id"})
    return
  }

  AccountService.checkExistAccount(id)
    .then(function (rows) {
      if (rows.length == 0) {
        res.statusCode = 422
        res.json({message: "Id you sent is not exist"})
        return
      } else {
        AccountService.requestAccountToUpdate(id)
          .then(function (rows) {
            if (rows.affectedRows === 1) {
              res.statusCode = 200
              res.json({message: "Success"})
            } else {
              res.statusCode = 500
              res.json({message: "Can not request user to update"})
            }
            return
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({ message: "Some thing went wrong" });
            return;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Some thing went wrong" });
      return;
    });
})

router.post("/disable", function(req, res, next) {
  let id = req.body.id
  if(!id) {
    res.statusCode = 422
    res.json({message: "You didn't send user id"})
    return
  }

  AccountService.checkExistAccount(id)
    .then(function (rows) {
      if (rows.length == 0) {
        res.statusCode = 422
        res.json({message: "Id you sent is not exist"})
        return
      } else {
        AccountService.disableAccount(id)
          .then(function (rows) {
            if (rows.affectedRows === 1) {
              res.statusCode = 200
              res.json({message: "Success"})
            } else {
              res.statusCode = 500
              res.json({message: "Can not disable user"})
            }
            return
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({ message: "Some thing went wrong" });
            return;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Some thing went wrong" });
      return;
    });
})

router.post("/unlock", function(req, res, next) {
  let id = req.body.id
  if(!id) {
    res.statusCode = 422
    res.json({message: "You didn't send user id"})
    return
  }

  AccountService.checkExistAccount(id)
    .then(function (rows) {
      if (rows.length == 0) {
        res.statusCode = 422
        res.json({message: "Id you sent is not exist"})
        return
      } else {
        AccountService.unlockAccount(id)
          .then(function (rows) {
            if (rows.affectedRows === 1) {
              res.statusCode = 200
              res.json({message: "Success"})
            } else {
              res.statusCode = 500
              res.json({message: "Can not unlock"})
            }
            return
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({ message: "Some thing went wrong" });
            return;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Some thing went wrong" });
      return;
    });
})

router.post("/updateIdCard", function(req, res, next) {
  let id = req.body.id
  if (!req.files) {
    res.statusCode = 422;
    res.json({ message: "Vui lòng chọn ảnh" });
    return;
  }
  if (
    !id || !req.files.id_card_front ||
    !req.files.id_card_behind
  ) {
    res.statusCode = 422;
    res.json({ message: "Vui lòng chọn đầy đủ ảnh" });
    return;
  }
  const id_card_front = req.files.id_card_front.data.toString("base64");
  const id_card_behind = req.files.id_card_behind.data.toString("base64");

  AccountService.checkExistAccount(id)
    .then(function (rows) {
      if (rows.length == 0) {
        res.statusCode = 422
        res.json({message: "Id you sent is not exist"})
        return
      } else {
        AccountService.updateIdCard(id_card_front, id_card_behind, id)
          .then(function (rows) {
            if (rows.affectedRows === 1) {
              res.statusCode = 200
              res.json({message: "Success"})
            } else {
              res.statusCode = 500
              res.json({message: "Can not update id card"})
            }
            return
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({ message: "Some thing went wrong" });
            return;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Some thing went wrong" });
      return;
    });
})
module.exports = router;
