var SHA256 = require("crypto-js/sha256");
var jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const { PUBLIC_URL, ADMIN_URL, ACTIVE_URL } = require("./constant");
const con = require("./connection.js");

const transporter = nodemailer.createTransport({
  service:'Gmail',
  auth: {
    user: "tranbing88@gmail.com",
    pass: "tri29112001",
  },
});

// const transporter = nodemailer.createTransport({
//   host: "mail.phongdaotao.com",
//   port: 25,
//   secure: false, // upgrade later with STARTTLS
//   auth: {
//     user: "sinhvien@phongdaotao.com",
//     pass: "svtdtu",
//   },
//   tls: {
//     // do not fail on invalid certs
//     rejectUnauthorized: false,
//   },
// });

module.exports = {
  hashPassword(password) {
    return SHA256(password).toString();
  },
  generateToken(username, password, user_id) {
    return jwt.sign(
      { username: username, password: password, user_id: user_id },
      process.env.SECRET_KEY
    );
  },
  getCurrentUser(req) {
    try {
      return req.cookies[process.env.TOKEN]
        ? jwt.verify(req.cookies[process.env.TOKEN], process.env.SECRET_KEY)
        : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  getCurrentUserId(req) {
    try {
      return req.cookies[process.env.TOKEN]
        ? jwt.verify(req.cookies[process.env.TOKEN], process.env.SECRET_KEY)['user_id']
        : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async sendMail(receiver, subject, content) {
    // send email
    await transporter.sendMail({
      from: "paynet@gmail.com",
      to: receiver,
      subject: subject,
      html: content,
    });
  },
  validatePublicUrl(url){
    for(item of PUBLIC_URL){
      if(url === item){
        return true;
      }
    }
    return false;
  },
  validateAdminUrl(url){
    for(item of ADMIN_URL){
      if(url === item){
        return true;
      }
    }
    return false;
  },
  validateActiveUrl(url){
    for(item of ACTIVE_URL){
      if(url === item){
        return true;
      }
    }
    return false;
  },
  generateNewNumberString: (length) => {
    var result = "";
    var characters = "0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  // This function is use to get have just inserted id
  getLastInsertId: () => {
    return new Promise(function (resolve, reject) {
      con.query(
        "SELECT LAST_INSERT_ID() as LAST_INSERT_ID;",
        [],
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
