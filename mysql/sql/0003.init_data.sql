use QUANLYVI;

insert into USERS(user_name, password, first_login) values
('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 0);

insert into `USERS` (`user_name`,`password`,`name`,`dob`,`phone`,`email`,`address`,`id_card_front`,`id_card_behind`,`status`,`time_create_status`,`active`,`failed_login_count`,`unsafe_login`,`time_block_account`,`balance`,`first_login`) values
('thanghy','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Thang Hy','2001-02-28', '0937164241', 'thanghy@gmail.com', 'HoaBinh', null, null, '2', '2022-05-07 13:00:06', '1', '0','0',NULL,'100000000','0'),
('dangtri','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','Dang Tri','2001-11-22', '0919684215', 'dangtri@gmail.com', 'BinhChanh', null, null, '2', '2022-05-08 14:21:47', '1', '0','0',NULL,'200000000','0');

insert into `CARD` (`user_id`,`card_number`,`exp_date`,`cvv`) values
('2','111111','2022-10-10','411'),
('2','222222','2022-11-11','443'),
('2','333333','2022-12-12','577');

insert into `DEPOSIT` (`user_id`,`deposit_amount`,`created_on`,`status`) values
('2','900000',NOW(),'1');

insert into `WITHDRAW` (`user_id`,`withdraw_amount`,`created_on`,`fee`,`message`,`status`) values
('2','200000',NOW(),NULL,N'Rút về tài khoản',NULL);

insert into `TRANSFER` (`user_id`,`recipient_id`,`transfer_amount`,`fee`,`fee_bearer`,`message`,`total`,`created_on`,`status`) values
(2,3,50000,NULL,0,N'Tặng bạn',52500,NOW(),1);

insert into `MOBILE_NETWORK` (`network_id`,`mobile_network_name`) values
('11111', 'Viettel'),
('22222', 'Mobifone'),
('33333', 'Vinaphone');

insert into `HISTORY`(deposit_id) values(1);
insert into `HISTORY`(withdraw_id) values(1);
insert into `HISTORY`(transfer_id) values(1);