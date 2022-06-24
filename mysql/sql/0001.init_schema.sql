create database if not exists QUANLYVI default character set utf8 collate utf8_unicode_ci;
use QUANLYVI;

create table USERS
(
	user_id int AUTO_INCREMENT,
	user_name varchar(10) not null,
	password varchar(255) not null,
	name nvarchar(255),
	dob date,
	phone varchar(11) unique,
	email varchar(255) unique,
	address nvarchar(255),
	id_card_front LONGTEXT,
	id_card_behind LONGTEXT,
    -- status: -2: đã bị khóa, -1: đã vô hiệu hóa, 0: chờ xác minh, 1: chờ cập nhật, 2: đã xác minh
	status int default 0,
	time_create_status DATETIME default NOW(),
    -- active: 0: đã bị khóa, 1: hoạt động
	active int default 1,
	failed_login_count int default 0,
    -- unsafe_login >= 2 : bị khóa vô thời hạn
    unsafe_login int default 0,
	time_block_account DATETIME,
	balance int default 0,
	first_login int default 1,
	created_on DATETIME default NOW(),
	PRIMARY KEY(user_id)
);

create table CARD
(
	card_id int AUTO_INCREMENT,
	user_id int,
	card_number int not null,
	exp_date DATETIME,
	cvv int,
    CONSTRAINT FK_CARD_USERS FOREIGN KEY(user_id) REFERENCES USERS(user_id),
	PRIMARY KEY(card_id)
);

-- Nạp tiền
create table DEPOSIT
(
	deposit_id int AUTO_INCREMENT,
	user_id int,
	deposit_amount int,
	created_on DATETIME default NOW(),
    -- status: 0: không thành công, 1: thành công
	status int default 1,
    CONSTRAINT FK_DEPOSIT_CARD FOREIGN KEY(user_id) REFERENCES USERS(user_id),
	PRIMARY KEY(deposit_id)
);


-- Rút tiền
create table WITHDRAW
(
	withdraw_id int AUTO_INCREMENT,
	user_id int,
	withdraw_amount int,
	created_on DATETIME default NOW(),
	fee int,
	message nvarchar(255),
    -- status: -1: không đồng ý, 0: đang chờ duyệt, 1: thành công
	status int default null,
    CONSTRAINT FK_WITHDRAW_CARD FOREIGN KEY(user_id) REFERENCES USERS(user_id),
	PRIMARY KEY(withdraw_id)
);


-- Chuyển tiền
create table TRANSFER
(
	transfer_id int AUTO_INCREMENT,
	user_id int,
	recipient_id int,
	transfer_amount int,
	fee int,
    -- fee_bearer: 0: người chuyển chịu phí, 1: người nhận chịu phí
    fee_bearer int,
	message nvarchar(255),
    total int,
    created_on DATETIME default NOW(),
    -- status: -1: không đồng ý, 0: đang chờ duyệt, 1: thành công
	status int default null,
    CONSTRAINT FK_TRANSFER_CARD FOREIGN KEY(user_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_TRANSFER_RECIPENT FOREIGN KEY(recipient_id) REFERENCES USERS(user_id),
	PRIMARY KEY(transfer_id)
);

-- Nhà mạng
create table MOBILE_NETWORK
(
    network_id int,
	mobile_network_name nvarchar(255),
	PRIMARY KEY(network_id)
);

create table BUYING_MOBILE_CARD
(
	buy_id int AUTO_INCREMENT,
	user_id int,
	network_id int,
	denomination int CHECK(denomination in(10000,20000,50000,100000)),
	quantity int CHECK(quantity between 1 and 5),
    fee int,
	total int,
    created_on DATETIME default NOW(),
    CONSTRAINT FK_MOBILE_CARD_USER FOREIGN KEY(user_id) REFERENCES USERS(user_id),
	CONSTRAINT FK_TRANSACTION_NETWORK FOREIGN KEY(network_id) REFERENCES MOBILE_NETWORK(network_id),
	PRIMARY KEY(buy_id)
);

create table HISTORY
(
	history_id int AUTO_INCREMENT,
	deposit_id int,
	withdraw_id int,
	transfer_id int,
	buy_card_id int,
	transaction_type nvarchar(255),
	time_create DATETIME default NOW(),
	note TEXT,
	status int,
    CONSTRAINT FK_HISTORY_MOBILE FOREIGN KEY(buy_card_id) REFERENCES BUYING_MOBILE_CARD(buy_id),
    CONSTRAINT FK_HISTORY_TRANSFER FOREIGN KEY(transfer_id) REFERENCES TRANSFER(transfer_id),
    CONSTRAINT FK_HISTORY_WITHDRAW FOREIGN KEY(withdraw_id) REFERENCES WITHDRAW(withdraw_id),
    CONSTRAINT FK_HISTORY_DEPOSIT FOREIGN KEY(deposit_id) REFERENCES DEPOSIT(deposit_id),
	PRIMARY KEY(history_id)
);