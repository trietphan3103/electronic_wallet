var express = require("express");
var moment = require('moment');
const {
  generatePassword,
  generateOTP,
} = require("../service/authenticate.service.js");
var router = express.Router();
const AuthenticateService = require("../service/authenticate.service.js");
const UserService = require("../service/user.service.js");
const {
  generateToken,
  hashPassword,
  getCurrentUser,
  sendMail,
  getCurrentUserId,
} = require("../utils.js");

let listUserOTP = [];

/* GET user list */
router.get("/", async function (req, res, next) {
  UserService.getUserList()
    .then(function (rows) {
      res.render("users/list", {
        layout: "layouts/main",
        users: rows,
        title: "Users page",
      });
    })
    .catch((err) =>
      setImmediate(() => {
        throw err;
      })
    ); // Throw async to escape the promise chain
});

// THAM KHẢO CÁCH LẤY CURRENT USER ID: http://localhost:4444/users/demo
router.get("/demo", async function (req, res, next) {
  res.statusCode = 200;
  res.json({ userid: getCurrentUserId(req) });
  return;
});

// POST to add user
router.post("/", function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;
  UserService.addUser(username, password)
    .then(function (rows) {
      res.redirect(303, "/users");
    })
    .catch((err) =>
      setImmediate(() => {
        throw err;
      })
    ); // Throw async to escape the promise chain
});

// GET ChangePassword View
router.get("/change-password", function (req, res, next) {
  res.render("users/changePassword", {
    title: "Change Password",
    layout: "layouts/main",
    user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
  });
});

// GET forgetPassword view
router.get("/forget-password", function (req, res, next) {
  res.render("users/forgetPassword", {
    title: "Forget Password",
    layout: "layouts/main",
  });
});

router.post("/forget-password-link", async function (req, res, next) {
  const { email } = req.body;
  const OTP = generateOTP();
  const email_content = `Bạn đã sử dụng tính năng quên mật khẩu trên PAYNET <br/> Mã OTP của bạn là: <b> ${OTP} </b> `;
  sendMail(email, `Quên mật khẩu trên PAYNET`, email_content)
    .then(() => {
      const now = new Date();
      listUserOTP.push({
        OTP: OTP,
        expireDate: new Date(now.setMinutes(now.getMinutes() + 1)),
        active: true,
      });
      res.statusCode = 200;
      res.json({
        message: "Success",
        email: email,
      });
      return;
    })
    .catch(() => {
      res.statusCode = 500;
      res.json({
        type: "text",
        message: `Không thể gửi được email cho: ${email}`,
      });
      return;
    });
});

router.post("/validate-otp", async function (req, res, next) {
  const { OTP, email } = req.body;
  const now = new Date();
  let isValidOTP = false;
  for (index in listUserOTP) {
    const item = listUserOTP[index];
    if (
      item.active &&
      item.OTP == OTP &&
      item.expireDate.getTime() >= now.getTime()
    ) {
      isValidOTP = true;
      res.statusCode = 200;
      res.json({
        message: `Succeed validated`,
        email: email,
      });
      return;
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

// GET login view
router.get("/login", function (req, res, next) {
  res.render("users/login", { title: "Login", layout: "layouts/main" });
});

// GET login view
router.get("/firstLogin", function (req, res, next) {
  const user_id = getCurrentUserId(req);
  if(!user_id) {
    res.redirect('/users/login')
    return
  } else {
    UserService.getCurrentUserDetail(user_id).then((rows) => {
      if(rows[0].first_login === 0) {
        res.redirect('/')
        return
      }
      res.render("users/firstLogin", {
        title: "First Login",
        layout: "layouts/main",
        user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
        user_detail: rows[0]
      });
    });
  }
});

// GET profile view
router.get("/profile", function (req, res, next) {
  const user_id = getCurrentUserId(req);
  UserService.getCurrentUserDetail(user_id).then((rows) => {
    res.render("users/profile", {
      title: "Profile",
      layout: "layouts/main",
      user: getCurrentUser(req) ? getCurrentUser(req) : undefined,
      user_detail: rows[0],
      moment: moment
    });
  });
});

// Handle login
router.post("/login", function (req, res, next) {
  let hashedPassword;
  const { username, password } = req.body;
  if (!username || !password) {
    res.statusCode = 422;
    res.json({ message: "Invalid data" });
    return;
  } else {
    hashedPassword = hashPassword(password);
  }

  AuthenticateService.validateLogin(username, hashedPassword)
    .then(function (user_login_rows) {
      if (!user_login_rows || user_login_rows.length < 1) {
        AuthenticateService.getUserByUsername(username).then(
          (check_user_exists_rows) => {
            if (!check_user_exists_rows || check_user_exists_rows.length < 1) {
              res.statusCode = 401;
              res.json({ message: "Invalid username or password" });
              return;
            } else {
              if(check_user_exists_rows[0]['status'] === -1){
                res.statusCode = 422;
                res.json({
                  message:
                    "Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008",
                });
                return;
              }

              AuthenticateService.validateAccountBlocked(username).then(
                (validate_blocked_rows) => {
                  if (
                    !validate_blocked_rows ||
                    validate_blocked_rows.length < 1
                  ) {
                    AuthenticateService.validateDisableAccount(username).then(
                      (validate_disable_rows) => {
                        if (
                          !validate_disable_rows ||
                          validate_disable_rows.length < 1
                        ) {
                          res.statusCode = 422;
                          res.json({
                            message:
                              "Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút",
                          });
                          return;
                        } else {
                          res.statusCode = 422;
                          res.json({
                            message:
                              "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ",
                          });
                          return;
                        }
                      }
                    );
                  } else {
                    AuthenticateService.updateUserFailedLogin(username)
                      .catch((err) => {
                        console.log(err);
                      })
                      .finally(() => {
                        res.statusCode = 401;
                        res.json({ message: "Invalid username or password" });
                        return;
                      });
                  }
                }
              );
            }
          }
        );
      } else {
        if(user_login_rows[0]['status'] === -1){
          res.statusCode = 422;
          res.json({
            message:
              "Tài khoản này đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008",
          });
          return;
        }

        AuthenticateService.validateAccountBlocked(username).then(
          (validate_blocked_rows) => {
            if (!validate_blocked_rows || validate_blocked_rows.length < 1) {
              AuthenticateService.validateDisableAccount(username).then(
                (validate_disable_rows) => {
                  if (
                    !validate_disable_rows ||
                    validate_disable_rows.length < 1
                  ) {
                    res.statusCode = 422;
                    res.json({
                      message:
                        "Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút",
                    });
                    return;
                  } else {
                    res.statusCode = 422;
                    res.json({
                      message:
                        "Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ",
                    });
                    return;
                  }
                }
              );
            } else {
              if (user_login_rows[0]["first_login"] === 1) {
                res.cookie(
                  process.env.TOKEN,
                  generateToken(
                    username,
                    password,
                    user_login_rows[0]["user_id"]
                  ),
                  {
                    expires: new Date(Date.now() + 9999999),
                    httpOnly: false,
                  }
                );
                res.json({ message: "FIRST LOGIN" });
                return;
              }

              AuthenticateService.updateLoginSuccess(username)
                .then(() => {
                  res.statusCode = 200;
                  res.cookie(
                    process.env.TOKEN,
                    generateToken(
                      username,
                      hashedPassword,
                      user_login_rows[0]["user_id"]
                    ),
                    {
                      expires: new Date(Date.now() + 9999999),
                      httpOnly: false,
                    }
                  );
                  res.json({ message: "Sign in success" });
                  return;
                })
                .catch((err) => {
                  console.log(err);
                  res.statusCode = 200;
                  res.cookie(
                    process.env.TOKEN,
                    generateToken(username, hashedPassword),
                    {
                      expires: new Date(Date.now() + 9999999),
                      httpOnly: false,
                    }
                  );
                  res.json({ message: "Sign in success" });
                  return;
                });
            }
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Something went wrong, please try again later" });
      return;
    });
});

// Handle logout
router.get("/logout", function (req, res, next) {
  res.clearCookie(process.env.TOKEN);
  res.redirect("/index");
});

// Handle signup
router.post("/signup", async function (req, res, next) {
  const { name, birthday, phone, address, email } = req.body;

  if (
    !name ||
    !birthday ||
    !phone ||
    !address ||
    !email ||
    !req.files ||
    !req.files.id_card_front ||
    !req.files.id_card_behind
  ) {
    res.statusCode = 422;
    res.json({ message: "Vui lòng điền đầy đủ thông tin" });
    return;
  }
  let username = "";
  let password = AuthenticateService.generatePassword();
  const hashedPassword = hashPassword(password);
  const id_card_front = req.files.id_card_front.data.toString("base64");
  const id_card_behind = req.files.id_card_behind.data.toString("base64");

  if (phone.length !== 10) {
    res.statusCode = 422;
    res.json({ message: "Số điện thoại phải có 10 số" });
    return;
  }

  AuthenticateService.checkPhoneExist(phone)
    .then(function (rows) {
      if (rows && rows.length >= 1) {
        res.statusCode = 422;
        res.json({ message: "Số điện thoại đã được đăng ký" });
        return;
      } else {
        AuthenticateService.checkEmailExist(email)
          .then(function (rows) {
            if (!rows || rows.length < 1) {
              AuthenticateService.getAllUserName()
                .then(function (rows) {
                  do {
                    username = AuthenticateService.generateUserName();
                  } while (!AuthenticateService.validateUserName(username, rows));

                  AuthenticateService.signup(
                    username,
                    hashedPassword,
                    name,
                    birthday,
                    phone,
                    address,
                    email,
                    id_card_front,
                    id_card_behind
                  )
                    .then((rows) => {
                      const emailContent = `<h3>Tài khoản của bạn đã được đăng ký thành công</h3><br/> Username:<b>${username}</b><br/>Password: <b>${password}</b>`;
                      sendMail(email, `Đăng ký tài khoản PAYNET`, emailContent)
                        .then(() => {
                          res.statusCode = 200;
                          res.setHeader("Content-Type", "application/json");
                          res.json({
                            type: "mail",
                            message: "Success",
                            email: email,
                          });
                          return;
                        })
                        .catch((error) => {
                          console.log(error);
                          res.statusCode = 200;
                          res.json({
                            type: "text",
                            message: "Success",
                            username: username,
                            password: password,
                          });
                          return;
                        });
                    })
                    .catch((err) => {
                      console.log(err);
                      res.statusCode = 500;
                      res.json({
                        message:
                          "Lỗi xảy ra khi cố gắng đăng ký người dùng mới",
                      });
                      return;
                    });
                })
                .catch((err) => {
                  console.log(err);
                  res.statusCode = 500;
                  res.json({
                    message: "Something went wrong, please try again later",
                  });
                  return;
                });
            } else {
              res.statusCode = 422;
              res.json({ message: "Email được sử dụng" });
              return;
            }
          })
          .catch((err) => {
            console.log(err);
            res.statusCode = 500;
            res.json({
              message: "Something went wrong, please try again later",
            });
            return;
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Something went wrong, please try again later" });
      return;
    });
});

router.post("/update-password", function (req, res, next) {
  let hashedPassword;
  let newHashedPassword;
  let { username, password, new_password, change_pass } = req.body;
  if (!new_password) {
    res.statusCode = 422;
    res.json({ message: "Invalid data" });
    return;
  } else {
    if (!username) {
      username = getCurrentUser(req)["username"];
    }
    if (!password) {
      password = getCurrentUser(req)["password"];
    }
    hashedPassword = hashPassword(password);
    newHashedPassword = hashPassword(new_password);
  }

  AuthenticateService.validateLogin(username, hashedPassword)
    .then(function (login_rows) {
      if (!login_rows || login_rows.length < 1) {
        res.statusCode = 401;
        res.json({ message: "Mật khẩu không chính xác" });
        return;
      }

      AuthenticateService.changePassword(
        username,
        hashedPassword,
        newHashedPassword
      )
        .then((rows) => {
          if (change_pass == 1) {
            res.statusCode = 200;
            res.json({ message: "success" });
            return;
          } else {
            res.statusCode = 200;
            res.cookie(
              process.env.TOKEN,
              generateToken(username, newHashedPassword, login_rows[0]['user_id']),
              {
                expires: new Date(Date.now() + 9999999),
                httpOnly: false,
              }
            );
            res.json({ message: "success" });
            return;
          }
        })
        .catch((err) => {
          console.log(err);
          res.statusCode = 500;
          res.json({
            message: "Lỗi xảy ra khi cập nhật mật khẩu mới",
          });
          return;
        });

      return;
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.json({ message: "Something went wrong, please try again later" });
      return;
    });
});

router.post("/resetPassword", function (req, res, next) {
  let newHashedPassword;
  let {email, new_password} = req.body;
  if (!new_password || !email) {
    res.statusCode = 422;
    res.json({ message: "Invalid data" });
    return;
  } else {
    newHashedPassword = hashPassword(new_password)
    UserService.changePasswordByMail(
      email,
      newHashedPassword
    )
      .then((rows) => {
          res.statusCode = 200;
          res.json({ message: "success" });
          return;
      })
      .catch((err) => {
        console.log(err);
        res.statusCode = 500;
        res.json({
          message: "Lỗi xảy ra khi cập nhật mật khẩu mới",
        });
        return;
      });
  }
});
module.exports = router;
