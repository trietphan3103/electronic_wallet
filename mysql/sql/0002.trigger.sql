use QUANLYVI;

DROP TRIGGER IF EXISTS insert_USERS_status;
DROP TRIGGER IF EXISTS update_USERS_status;
DROP TRIGGER IF EXISTS insert_WITHDRAW_withdraw_amount;
DROP TRIGGER IF EXISTS update_WITHDRAW_withdraw_amount;
DROP TRIGGER IF EXISTS WITHDRAW_count_max;
DROP TRIGGER IF EXISTS insert_WITHDRAW_fee;
DROP TRIGGER IF EXISTS update_WITHDRAW_fee;
DROP TRIGGER IF EXISTS insert_WITHDRAW_status;
DROP TRIGGER IF EXISTS update_WITHDRAW_status;
DROP TRIGGER IF EXISTS insert_WITHDRAW_amount_status;
DROP TRIGGER IF EXISTS insert_WITHDRAW_amount_user_balance;
DROP TRIGGER IF EXISTS update_WITHDRAW_amount_user_balance;
DROP TRIGGER IF EXISTS insert_TRANSFER_status;
DROP TRIGGER IF EXISTS update_TRANSFER_status;
DROP TRIGGER IF EXISTS insert_TRANSFER_fee;
DROP TRIGGER IF EXISTS update_TRANSFER_fee;
DROP TRIGGER IF EXISTS insert_TRANSFER_amount_status;
DROP TRIGGER IF EXISTS insert_TRANSFER_fee_bearer;
DROP TRIGGER IF EXISTS insert_TRANSFER_amount_user_balance;
DROP TRIGGER IF EXISTS update_TRANSFER_amount_user_balance;
DROP TRIGGER IF EXISTS insert_TRANSFER_recipient_phone;
DROP TRIGGER IF EXISTS update_TRANSFER_recipient_phone;
DROP TRIGGER IF EXISTS insert_buying_mobile_card;
DROP TRIGGER IF EXISTS insert_deposit;
-- --------------------------------------------------------
-- ------------------------ USER --------------------------
-- --------------------------------------------------------
DELIMITER $$ 
create trigger insert_USERS_status
before insert
on USERS
for each row
begin
	if new.status not between -2 and 2 then
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = N'Re-enter the users status';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_USERS_status
before update
on USERS
for each row
begin
	if new.status not between -2 and 2 then
		SIGNAL SQLSTATE '45001'
			SET MESSAGE_TEXT = 'Re-enter the users status';
	end if;
end$$
DELIMITER ;

-- --------------------------------------------------------
-- ---------------------- WITHDRAW ------------------------
-- --------------------------------------------------------
DELIMITER $$
create trigger insert_WITHDRAW_withdraw_amount
before insert
on WITHDRAW
for each row
begin
	if not(new.withdraw_amount % 50000 = 0) then
		SIGNAL SQLSTATE '45002'
            SET MESSAGE_TEXT = 'Withdrawal amount each time must be a multiple of 50000';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_WITHDRAW_withdraw_amount
before update
on WITHDRAW
for each row
begin
	if not(new.withdraw_amount % 50000 = 0) then
		SIGNAL SQLSTATE '45003'
            SET MESSAGE_TEXT = 'Withdrawal amount each time must be a multiple of 50000';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger WITHDRAW_count_max
before insert
on WITHDRAW
for each row
begin
	if(SELECT count(*) FROM WITHDRAW WHERE user_id = new.user_id and created_on = new.created_on) > 2 then
		SIGNAL SQLSTATE '45004'
            SET MESSAGE_TEXT = 'Can only withdraw up to 2 times a day';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_WITHDRAW_fee
before insert
on WITHDRAW
for each row
begin
	SET new.fee = new.withdraw_amount * 5/100 ;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_WITHDRAW_fee
before update
on WITHDRAW
for each row
begin
	SET new.fee = new.withdraw_amount * 5/100 ;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_WITHDRAW_status
before insert
on WITHDRAW
for each row
begin
	if new.status not between -1 and 1 then
		SIGNAL SQLSTATE '45005'
			SET MESSAGE_TEXT = 'Re-enter the withdraw status';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_WITHDRAW_status
before update
on WITHDRAW
for each row
begin
	if new.status not between -1 and 1 then
		SIGNAL SQLSTATE '45006'
			SET MESSAGE_TEXT = 'Re-enter the withdraw status';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_WITHDRAW_amount_status
before insert
on WITHDRAW
for each row
begin
	if (new.withdraw_amount <= 5000000) then
		SET new.status = 1;
	else
		SET new.status = 0;
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_WITHDRAW_amount_user_balance
after insert
on WITHDRAW
for each row
begin
	if (new.status = 1) then
		UPDATE USERS SET balance = balance - (new.withdraw_amount + new.fee) WHERE USERS.user_id = new.user_id;
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_WITHDRAW_amount_user_balance
after update
on WITHDRAW
for each row
begin
	if (new.status = 1) then
		UPDATE USERS SET balance = balance - (new.withdraw_amount + new.fee) WHERE USERS.user_id = new.user_id;
	end if;
end$$
DELIMITER ;

-- ---------------------------------------------------------
-- ---------------------- TRANSFER -------------------------
-- ---------------------------------------------------------
DELIMITER $$
create trigger insert_TRANSFER_status
before insert
on TRANSFER
for each row
begin
	if new.status not between -1 and 1 then
		SIGNAL SQLSTATE '45007'
			SET MESSAGE_TEXT = 'Re-enter the transfer status';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_TRANSFER_status
before update
on TRANSFER
for each row
begin
	if new.status not between -1 and 1 then
		SIGNAL SQLSTATE '45008'
			SET MESSAGE_TEXT = 'Re-enter the transfer status';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_TRANSFER_fee
before insert
on TRANSFER
for each row
begin
	SET new.fee = new.transfer_amount * 5/100 ;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_TRANSFER_fee
before update
on TRANSFER
for each row
begin
	SET new.fee = new.transfer_amount * 5/100 ;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_TRANSFER_amount_status
before insert
on TRANSFER
for each row
begin
	if (new.transfer_amount <= 5000000) then
		SET new.status = 1;
	else
		SET new.status = 0;
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_TRANSFER_fee_bearer
before insert
on TRANSFER
for each row
begin
	if new.fee_bearer not between 0 and 1 then
		SIGNAL SQLSTATE '45008'
			SET MESSAGE_TEXT = 'Re-enter the fee bearer';
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger insert_TRANSFER_amount_user_balance
after insert
on TRANSFER
for each row
begin
    if (new.status = 1) then
        if (new.fee_bearer = 0) then
            UPDATE USERS
            SET balance = balance - (new.transfer_amount + new.fee) 
            WHERE USERS.user_id = new.user_id;
            
            UPDATE USERS
            SET balance = balance + new.transfer_amount 
            WHERE USERS.user_id = new.recipient_id;
        else                       
            UPDATE USERS
            SET balance = balance - new.transfer_amount 
            WHERE USERS.user_id = new.user_id;

            UPDATE USERS
            SET balance = balance + (new.transfer_amount - new.fee)
            WHERE USERS.user_id = new.recipient_id;
	    end if;
	end if;
end$$
DELIMITER ;

DELIMITER $$
create trigger update_TRANSFER_amount_user_balance
after update
on TRANSFER
for each row
begin
    if (new.status = 1) then
        if (new.fee_bearer = 0) then
            UPDATE USERS
            SET balance = balance - (new.transfer_amount + new.fee) 
            WHERE USERS.user_id = new.user_id;
            
            UPDATE USERS
            SET balance = balance + new.transfer_amount 
            WHERE USERS.user_id = new.recipient_id;
        else                       
            UPDATE USERS
            SET balance = balance - new.transfer_amount 
            WHERE USERS.user_id = new.user_id;

            UPDATE USERS
            SET balance = balance + (new.transfer_amount - new.fee)
            WHERE USERS.user_id = new.recipient_id;
	    end if;
	end if;
end$$
DELIMITER ;

-- ---------------------------------------------------------
-- ------------------ BUYING_MOBILE_CARD -------------------
-- ---------------------------------------------------------

DELIMITER $$
create trigger insert_buying_mobile_card
after insert
on BUYING_MOBILE_CARD
for each row
begin
	UPDATE USERS SET balance = balance - new.total WHERE USERS.user_id = new.user_id;
end$$
DELIMITER ;

-- ---------------------------------------------------------
-- ------------------ DEPOSIT -------------------
-- ---------------------------------------------------------

DELIMITER $$
create trigger insert_deposit
after insert
on DEPOSIT
for each row
begin
	UPDATE USERS SET balance = balance + new.deposit_amount WHERE USERS.user_id = new.user_id;
end$$
DELIMITER ;