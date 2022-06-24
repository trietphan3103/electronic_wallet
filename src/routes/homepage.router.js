var express = require("express");
const UserService = require("../service/user.service.js");
const { getCurrentUser,
  getCurrentUserId } = require("../utils");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  const user_id = getCurrentUserId(req);
  UserService.getCurrentUserDetail(user_id).then((rows) => {
    res.render("index", {
      title: "Home page",
      layout: "layouts/main",
      user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      user_detail: rows[0]
    });
  });
});

router.get('/error403', function(req, res, next) {
  let message = req.query.message ?? "You are not allowed to get this page "
  res.render('error403', { title: 'ERROR', layout: 'layouts/main', message});
});

module.exports = router;
