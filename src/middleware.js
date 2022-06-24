const e = require('express');
const con = require('./connection');
const UserService = require('./service/user.service');
const {validateAdminUrl, validateActiveUrl, getCurrentUserId} = require('./utils')

class Middleware {
    static checkConnection = function(req, res, next) {
        if (!con._connectCalled) {
            con.connect(function (err) {
              if (err) throw err;
            });
        }
        next();
    }

    // Middleware check admin role
    static requireAdmin = async function(req, res, next) {
        let user_id = getCurrentUserId(req)
        if(validateAdminUrl(req.url)) {
            let checkAdmin = await UserService.checkAdmin(user_id)
            if(checkAdmin.length < 1) {
                res.redirect('/error403?message="Đây là trang của admin bạn không có quyền truy cập"')
            } else {
                next()
            }
        } else {
            next()
        }
    };

    // Middleware check active account
    static requireActive = async function(req, res, next) {
        let user_id = getCurrentUserId(req)
        if(validateActiveUrl(req.url)) {
            let checkActive = await UserService.checkActive(user_id)
            if(checkActive.length < 1) {
                res.redirect('/error403?message="Đây là trang dành cho tài khoản đã được xác minh"')
            } else {
                next()
            }
        } else {
            next()
        }
    };

    static checkFisrtLogin = async function(req, res, next) {
        const user_id = getCurrentUserId(req);
        if(req.url === '/users/logout' || req.url === '/users/update-password') {
            next()
        } else if(req.cookies && req.cookies[process.env.TOKEN] && req.url !== '/users/firstLogin') {
            UserService.getCurrentUserDetail(user_id).then((rows) => {
                if(rows && rows[0] && rows[0].first_login === 1) {
                    res.redirect('/users/firstLogin')
                } else {
                    next()
                }
            });
        } else {
            next()
        }
    };
}


module.exports = Middleware;