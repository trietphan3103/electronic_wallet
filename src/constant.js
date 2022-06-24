const PUBLIC_URL = [
  "/",
  "/users/signup",
  "/users/update-password",
  "/users/forget-password",
  "/users/forget-password-link",
  "/users/validate-otp",
  "/users/resetPassword"
];

const ADMIN_URL = [
  "/account/listActivatedAccount",
  "/account/listWaitingAccount",
  "/account/listDisabledAccount",
  "/account/listLockedAccount",
  "/transaction/listWaitingTransaction",
];

const ACTIVE_URL = [
  "/transaction/recharge",
  "/transaction/withdraw",
  "/transfer/transfer",
  "/transaction/transaction-history",
  "/card/buy-card",
];

module.exports = { PUBLIC_URL, ADMIN_URL, ACTIVE_URL };
