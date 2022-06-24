const HOST = "http://localhost:4444";

$(document).ready(() => { 
    // *******************************************************
    // ********** view/partials/header.ejs
    // *******************************************************


    // Hàm thay đổi header khi scroll
    function _headerScrolled() {
        let header = document.getElementById('header')
        if (window.scrollY > 0) {
            header.classList.add('header-scrolled')
        } else {
            header.classList.remove('header-scrolled')
        }
    };

    // Gọi hàm _headerScrolled khi scroll
    $(document).scroll(_headerScrolled);


    // Khi click vào nút mobile menu thì thêm xóa các class liên quan để 
    // hiển thị giao diện phù hợp
    $('.mobile-nav-toggle').click((e) => {
        let navbar = document.getElementById('navbar')
        navbar.classList.toggle('navbar-mobile')
        e.target.classList.toggle('fa-bars')
        e.target.classList.toggle('fa-times')

        let dropdownActives = document.querySelectorAll('.navbar .dropdown > a')
        dropdownActives.forEach(dropdownActive => {
            dropdownActive.nextElementSibling.classList.remove('dropdown-active')
        });

        let dropdownArrowsM = document.querySelectorAll('.navbar .dropdown .dropdown-icon-mobile')
        dropdownArrowsM.forEach(el => {
            //reset chiều icon
            el.classList.replace('fa-chevron-down', 'fa-chevron-right')
            let dropdown = el.parentElement
                // bắt click dropdown thay đổi icon
            $(dropdown).bind('click.changeArrow', e => {
                el.classList.toggle('fa-chevron-right')
                el.classList.toggle('fa-chevron-down')
            })
        })
    });

    // Bắt sự kiện click dropdown
    let dropdownActives = document.querySelectorAll('.navbar .dropdown > a')
    dropdownActives.forEach(dropdownActive => {
        $(dropdownActive).click(e => {
            if (e.target.nextElementSibling) {
                e.target.nextElementSibling.classList.toggle('dropdown-active')
            }
        });
    });
    let dropdownArrowsM = document.querySelectorAll('.navbar .dropdown .dropdown-icon-mobile')
    dropdownArrowsM.forEach(el => {
        // bắt click arrow để dropdown 
        $(el).bind('click', e => {
            el.parentElement.nextElementSibling.classList.toggle('dropdown-active')
        })
    })

    //Ngừng scroll khi bật navbar-mobile
    $(document).scroll(e => {
        if (document.querySelector('.navbar-mobile') !== null) {
            _disableScroll();
        } else {
            _enableScroll();
        }
    });

    function _disableScroll() {
        window.onscroll = function() {
            window.scrollTo(0, 0);
        };
    }

    function _enableScroll() {
        window.onscroll = function() {};
    }

    //drag to scroll task-manager-container

    const slider = $('.task-manager-container')[0];
    let isMouseDown = false;
    let startX;
    let scrollLeft;

    $(slider).mousedown(e => {
        isMouseDown = true;
        slider.classList.add('scroll-active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    $(slider).mouseleave(e => {
        isMouseDown = false;
        slider.classList.remove('scroll-active');
    });

    $(slider).mouseup(e => {
        isMouseDown = false;
        slider.classList.remove('scroll-active');
    });
    $(slider).mousemove(e => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;
    });

    if(window.location.pathname === '/account/listActivatedAccount') {
        $('tbody .view-detail-btn').click(e => {
            let id = $(e.target).data('id')
            let name = $(e.target).data('name')
            let user_name = $(e.target).data('user_name')
            let phone = $(e.target).data('phone')
            let dob = $(e.target).data('dob')
            let created_on = $(e.target).data('created_on')
            let email = $(e.target).data('email')
            let address = $(e.target).data('address')
            let card_front = $(e.target).data('card_front')
            let card_behind = $(e.target).data('card_behind')
            let time_block_account = $(e.target).data('time_block_account')

            $('#detail-account .name').text(name)
            $('#detail-account .user_name').text(user_name)
            $('#detail-account .dob').text(dob)
            $('#detail-account .phone').text(phone)
            $('#detail-account .created_on').text(created_on)
            $('#detail-account .email').text(email)
            $('#detail-account .address').text(address)
            $('#detail-account .card_front').attr('src', card_front)
            $('#detail-account .card_behind').attr('src', card_behind)
            $('#unlock_confirm_modal .unlock-confirm-btn').attr('data-id', id)

            $.ajax({
                url: `/transaction/list-transaction-history?user_id=${id}`,
                method: "GET",
                timeout: 0,
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                success: function (xhr, e, settings) {
                    try {
                    xhr = JSON.parse(xhr);
                    } catch (error) {
                    xhr = xhr
                    }
                    const historyList = xhr;
                    let htmlStr = "";
                    for(var i=0; i<historyList.length; i++) {
                        htmlStr += 
                        `<tr>
                            <th scope="row">${i + 1}</th>
                            <td>${historyList[i].TYPE == 1? "Nạp tiền": 
                                historyList[i].TYPE == 2? "Rút tiền": 
                                historyList[i].TYPE == 3? "Chuyển tiền": 
                                historyList[i].TYPE == 4? "Mua thẻ điện thoại": 
                                "Không rõ"}</td>
                            <td>${historyList[i].CREATED_ON ? moment(historyList[i].CREATED_ON).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : ""  }</td>
                            <td>${historyList[i].HISTORY_TOTAL}</td>
                            <td>${historyList[i].HISTORY_STATUS == 1?"Thành công":
                                historyList[i].HISTORY_STATUS == 0?"Chờ duyệt":
                                "Thất bại"}</td>
                            <td>
                            <button type="button" class="btn btn-link" data-toggle="modal" onclick='listActivatedAccount_viewDetail(${historyList[i].TYPE},${historyList[i].HISTORY_ID},${historyList[i].TRANSACTION_ID},${id})'>
                                Xem chi tiết
                            </button>
                            </td>
                        </tr>`;
                    }
                    
                    $("#historyList").html(htmlStr);

                },
                error: function (xhr, text, err) {
                    $("#alert_danger").css("display", "block");
                    $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
                },
            });

        })

        
    }

    if(window.location.pathname === '/account/listDisabledAccount') {
        $('tbody .view-detail-btn').click(e => {
            let id = $(e.target).data('id')
            let name = $(e.target).data('name')
            let user_name = $(e.target).data('user_name')
            let phone = $(e.target).data('phone')
            let dob = $(e.target).data('dob')
            let created_on = $(e.target).data('created_on')
            let email = $(e.target).data('email')
            let address = $(e.target).data('address')
            let card_front = $(e.target).data('card_front')
            let card_behind = $(e.target).data('card_behind')
            let time_block_account = $(e.target).data('time_block_account')
    
            $('#detail-account .name').text(name)
            $('#detail-account .user_name').text(user_name)
            $('#detail-account .dob').text(dob)
            $('#detail-account .phone').text(phone)
            $('#detail-account .created_on').text(created_on)
            $('#detail-account .email').text(email)
            $('#detail-account .address').text(address)
            $('#detail-account .card_front').attr('src', card_front)
            $('#detail-account .card_behind').attr('src', card_behind)
        })
    }

    if(window.location.pathname === '/account/listLockedAccount') {
        $('tbody .view-detail-btn').click(e => {
            let id = $(e.target).data('id')
            let name = $(e.target).data('name')
            let user_name = $(e.target).data('user_name')
            let dob = $(e.target).data('dob')
            let email = $(e.target).data('email')
            let address = $(e.target).data('address')
            let card_front = $(e.target).data('card_front')
            let card_behind = $(e.target).data('card_behind')
            let time_block_account = $(e.target).data('time_block_account')
      
            $('#detail-account .name').text(name)
            $('#detail-account .user_name').text(user_name)
            $('#detail-account .dob').text(dob)
            $('#detail-account .time_block_account').text(time_block_account)
            $('#detail-account .email').text(email)
            $('#detail-account .address').text(address)
            $('#detail-account .card_front').attr('src', card_front)
            $('#detail-account .card_behind').attr('src', card_behind)
            $('#unlock_confirm_modal .unlock-confirm-btn').attr('data-id', id)
        })
      
        $("#unlock_confirm_modal .unlock-confirm-btn").on("click", function (e) {
            let id = $(e.target).data('id')
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            const form = new FormData();
            form.append("id", id);
    
            $.ajax({
                type: "POST",
                url: "/account/unlock",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                try {
                    xhr = JSON.parse(xhr);
                } catch (error) {
                    xhr = xhr
                }
                $("#unlock_confirm_modal").modal("hide");
                $("#detail-account").modal("hide");
    
                $('tbody .user_row_'+id).remove()
                $("#alert_info").css("display", "block");
                $("#alert_info").html("Mở khóa tài khoản thành công");
                },
                error: function (xhr, text, err) {
                $("#unlock_confirm_modal").modal("hide");
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    }

    if(window.location.pathname === '/account/listWaitingAccount') {
        $('tbody .view-detail-btn').click(e => {
            let id = $(e.target).data('id')
            let name = $(e.target).data('name')
            let user_name = $(e.target).data('user_name')
            let dob = $(e.target).data('dob')
            let email = $(e.target).data('email')
            let address = $(e.target).data('address')
            let card_front = $(e.target).data('card_front')
            let card_behind = $(e.target).data('card_behind')
      
            $('#detail-account .name').text(name)
            $('#detail-account .user_name').text(user_name)
            $('#detail-account .dob').text(dob)
            $('#detail-account .email').text(email)
            $('#detail-account .address').text(address)
            $('#detail-account .card_front').attr('src', card_front)
            $('#detail-account .card_behind').attr('src', card_behind)
            $('#approve-confirm .approve-btn').attr('data-id', id)
            $('#request-for-more-confirm .request-update-btn').attr('data-id', id)
            $('#disapprove-confirm .disapprove-btn').attr('data-id', id)
        })
      
        $("#approve-confirm .approve-btn").on("click", function (e) {
            let id = $(e.target).data('id')
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            const form = new FormData();
            form.append("id", id);
    
            $.ajax({
                type: "POST",
                url: "/account/activate",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                try {
                    xhr = JSON.parse(xhr);
                } catch (error) {
                    xhr = xhr
                }
                $("#approve-confirm").modal("hide");
                $("#detail-account").modal("hide");
    
                $('tbody .user_row_'+id).remove()
                $("#alert_info").css("display", "block");
                $("#alert_info").html("Xác minh tài khoản thành công");
                },
                error: function (xhr, text, err) {
                $("#approve-confirm").modal("hide");
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    
        $("#request-for-more-confirm .request-update-btn").on("click", function (e) {
            let id = $(e.target).data('id')
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            const form = new FormData();
            form.append("id", id);
    
            $.ajax({
                type: "POST",
                url: "/account/requestUpdate",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                try {
                    xhr = JSON.parse(xhr);
                } catch (error) {
                    xhr = xhr
                }
                $("#request-for-more-confirm").modal("hide");
                $("#detail-account").modal("hide");
    
                $('tbody .user_row_'+id).remove()
                $("#alert_info").css("display", "block");
                $("#alert_info").html("Yêu cầu tài khoản bổ sung thông tin thành công");
                },
                error: function (xhr, text, err) {
                $("#request-for-more-confirm").modal("hide");
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
      
        $("#disapprove-confirm .disapprove-btn").on("click", function (e) {
            let id = $(e.target).data('id')
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            const form = new FormData();
            form.append("id", id);
    
            $.ajax({
                type: "POST",
                url: "/account/disable",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                try {
                    xhr = JSON.parse(xhr);
                } catch (error) {
                    xhr = xhr
                }
                $("#disapprove-confirm").modal("hide");
                $("#detail-account").modal("hide");
    
                $('tbody .user_row_'+id).remove()
                $("#alert_info").css("display", "block");
                $("#alert_info").html("Vô hiệu hóa thành công");
                },
                error: function (xhr, text, err) {
                $("#disapprove-confirm").modal("hide");
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    }

    if(window.location.pathname === '/card/buy-card') {
        let price = 0;
        let quantity = 1;
        $('input[type="radio"][name="amount"]').on('input', function() {
            price = $('input[type="radio"][name="amount"]:checked').val()
            $('#total_price').html((price * quantity).toLocaleString('it-IT', {style: 'currency', currency: 'VND'}))

        })
    
        $('#quantity').on('input', function () {
            quantity = $(this).val();
            price = $('input[type="radio"][name="amount"]:checked').val()
            $('#total_price').html((price * quantity).toLocaleString('it-IT', {style: 'currency', currency: 'VND'}))
        });
    
        $("#buy_card_form").on("submit", function (e) {
            e.preventDefault();
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
    
            const form = new FormData();
            form.append("network_id", $("#mobile_network_id").val());
            form.append("quantity", quantity);
            form.append("denomination", price);
    
            $.ajax({
                url: "/card/buy-card",
                method: "POST",
                timeout: 0,
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                    try {
                        xhr = JSON.parse(xhr);
                    } catch (error) {
                        xhr = xhr
                    }
                    $("#buy_card").css("display", "none");
                    $("#complete_block").css("display", "block");
                    $("#buy_card_complete").css("display", "block");
    
                    $("#alert_info2").css("display", "block");
                    $("#alert_info2").html("Mua thẻ thành công");
    
                    let listCardStr = "";
    
                    for(i in xhr['cardList']){
                        listCardStr += 
                        `<tr>
                            <th scope="row">${parseInt(i) + 1}</th>
                            <td>${xhr['cardList'][i]['network_name']}</td>
                            <td>${xhr['cardList'][i]['card_number']}</td>
                            <td>${parseInt(xhr['cardList'][i]['denomination']).toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</td>
                        </tr>`;
                    }
    
                    $("#result_body").html(listCardStr);
                },
                error: function (xhr, text, err) {
                    $("#alert_danger").css("display", "block");
                    $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    }

    if(window.location.pathname === '/transfer/transfer') {
        // Check input số điện thoại, click ra ngoài
        $("#transfer-recipient").focusout(function(e) {
            let transferPhone = $(this).val();
            if(isNaN(transferPhone)) {
                $("#message_transfer_recipient").css("display", "block");
                $("#message_transfer_recipient").html("Vui lòng chỉ nhập số");
            }
            else if(transferPhone.length != 10) {
                $("#message_transfer_recipient").css("display", "block");
                $("#message_transfer_recipient").html("Vui lòng số điện thoại có 10 chữ số");
            } else {
                $("#message_transfer_recipient").css("display", "none");
            }

            const form = new FormData();
            form.append("recipient_phone", $("#transfer-recipient").val());

            $.ajax({
                url: "/transfer/getNameByPhone",
                method: "POST",
                timeout: 0,
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                    try {
                        xhr = JSON.parse(xhr);
                    } catch (error) {
                        xhr = xhr
                    }
                    $("#message_transfer_recipient").css("display", "none");

                    $("#recipient_name").text(`${xhr.name}`);
                },
                error: function (xhr, text, err) {
                    $("#recipient_name").text(``);
                    $("#message_transfer_recipient").css("display", "block");
                    $("#message_transfer_recipient").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });

        // Check input số tiền muốn chuyển, click ra ngoài
        $("#transfer-amount").focusout(function(e) {
            let transferAmount = $(this).val();
            let fee = parseInt(transferAmount * 5 / 100); // tính fee
            
            if(isNaN(transferAmount)) { // check chỉ có số
                $("#message_transfer_amount").css("display", "block");
                $("#message_transfer_amount").html("Vui lòng chỉ nhập số");
            } else {
                e.preventDefault();
                $("#message_transfer_amount").css("display", "none");
            }

            // Tự update fee
            $("#transfer-fee").html(fee);
            $("#transfer-fee").val(fee);
            $("#transfer-fee").css("display", "block");

            // Tự update total
            $("#transfer_total").html(parseInt(Number(transferAmount) + Number(fee)));
            $("#transfer_total").val(parseInt(Number(transferAmount) + Number(fee)));
            $("#transfer_total").css("display", "block");
        });

        // Check note cần phải ghi nội dung
        $("#transfer-note").focusout(function(e) {
            if(!$(this).val()) {
                $("#message_transfer_note").css("display", "block");
                $("#message_transfer_note").html("Vui lòng nhập nội dung chuyển tiền");
            } else {
                $("#message_transfer_note").css("display", "none");
            }
        });

        $("#transfer_form").on("submit", function (e) {
            e.preventDefault();
            $("#alert_danger").css("display", "none");
            let bearer = $("input[name='transfer-bearer']:checked").val()

            const form = new FormData();
            form.append("recipient_phone", $("#transfer-recipient").val());
            form.append("transfer_amount", $("#transfer-amount").val());
            form.append("fee", $("#transfer-fee").val());
            form.append("fee_bearer", bearer);
            form.append("message", $("#transfer-note").val());
            form.append("transfer_total", $("#transfer_total").val());
        
            $("#submit-btn").attr("disabled", true);
            $('#loader').css("display", "block");

            $.ajax({
                url: "/transfer/transfer",
                method: "POST",
                timeout: 0,
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                    try {
                        xhr = JSON.parse(xhr);
                    } catch (error) {
                        xhr = xhr
                    }

                    $('#submit-otp-btn').data("date", xhr.expireDate)

                    $('#transfer-box').css("display", "none");
                    $('#confirm-otp-box').css("display", "block");

                    $("#alert_info").css("display", "block");
                    $("#alert_info").html(`Vui lòng nhập OTP xác nhận đã được gửi đến ${xhr.email}`);
                },
                error: function (xhr, text, err) {
                    $("#submit-btn").attr("disabled", false);
                    $('#loader').css("display", "none");
                    $("#alert_danger").css("display", "block");
                    $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });

        $("#confirm-otp-form").on("submit", function (e) {
            e.preventDefault();
            $("#alert_danger2").css("display", "none");

            const form = new FormData();
            form.append("OTP", $("#OTP").val());
            form.append("identity_time", $("#submit-otp-btn").data('date'));

            $("#submit-otp-btn").attr("disabled", true);
            $('#loader2').css("display", "block");

            $.ajax({
                url: "/transfer/validate-otp",
                method: "POST",
                timeout: 0,
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                    try {
                        xhr = JSON.parse(xhr);
                    } catch (error) {
                        xhr = xhr
                    }

                    $('#transfer-box').css("display", "none");
                    $('#confirm-otp-box').css("display", "block");

                    $("#submit-otp-btn").css("display", "none");                
                    $("#complete_block").css("display", "block"); 
                    $('#loader2').css("display", "none");
                    $("#alert_info").css("display", "block");                
                    $("#alert_info").html(`${xhr.message}`);

                },
                error: function (xhr, text, err) {
                    $("#submit-otp-btn").attr("disabled", false);
                    $('#loader2').css("display", "none");
                    $("#alert_info").css("display", "none");                
                    $("#alert_danger2").css("display", "block");
                    $("#alert_danger2").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    }

    if(window.location.pathname === '/transaction/recharge') {
        $("#recharge_form").on("submit", function (e) {
            e.preventDefault()
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            const form = new FormData(document.getElementById("recharge_form"));
    
            $.ajax({
                type: "POST",
                url: "/transaction/recharge",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                  try {
                      xhr = JSON.parse(xhr);
                  } catch (error) {
                      xhr = xhr
                  }
                  $("#alert_info").css("display", "block");
                  $(".btn-accept").css("display", "none");
                  $("#complete_block").css("display", "block");
                  $("#alert_info").html("Nạp tiền thành công");
                },
                error: function (xhr, text, err) {
                  $("#alert_danger").css("display", "block");
                  $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    }

    if(window.location.pathname === '/transaction/withdraw') {
        $('#withdraw_amount').on('keyup', () => {
            let widthdraw_amount = $('#withdraw_amount').val()
            let fee = parseInt(widthdraw_amount*5/100);
            let total = parseInt(widthdraw_amount) + parseInt(fee)
            $('#fee').val(fee)
            $('#total').val(total)
        })
    
        $("#withdraw_form").on("submit", function (e) {
            e.preventDefault()
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            const form = new FormData(document.getElementById("withdraw_form"));
    
            $.ajax({
                type: "POST",
                url: "/transaction/withdraw",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
                success: function (xhr, e, settings) {
                  try {
                      xhr = JSON.parse(xhr);
                  } catch (error) {
                      xhr = xhr
                  }
                  
                  $("#alert_info").css("display", "block");
                  $("#complete_block").css("display", "block");
                  $(".button-accept").css("display", "none");
                  $("#alert_info").html(xhr["message"]);
                },
                error: function (xhr, text, err) {
                  $("#alert_danger").css("display", "block");
                  $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
                },
            });
        });
    }

    if(window.location.pathname === '/users/change-password') {
        $("#update_pass_form").on("submit", function (e) {
            e.preventDefault();
        
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");

        
            if ($("#new_password").val() !== $("#confirm_new_password").val()) {
              $("#alert_danger").css("display", "block");
              $("#alert_danger").html("Mật khẩu không trùng khớp");
              return;
            }
        
            $.ajax({
              url: "/users/update-password",
              type: "POST",
              data: $("form").serialize(),
              success: function (xhr, e, settings) {
                //   window.location = "/";
                // $("#update_pass_form").css("display", "none");
                $("#complete_block").css("display", "block");
                $("#alert_info").css("display", "block");
                $("#alert_info").html(
                  `Đổi mật khẩu thành công`
                );
              },
              error: function (xhr, text, err) {
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr["responseText"])["message"]);
              },
            });
        });
    }

    if(window.location.pathname === '/users/forget-password') {
        $("#forget_pass_form").on("submit", function (e) {
            e.preventDefault();
    
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            $("#loader").css("display", "block");
            $("#forget_pass_btn").attr("disabled", true);
    
            $.ajax({
                type: "POST",
                url: "/users/forget-password-link",
                data: $("#forget_pass_form").serialize(),
                success: function (xhr, e, settings) {
                    $("#forget_pass_btn").attr("disabled", false);
                    $("#loader").css("display", "none");
                    $("#alert_info2").css("display", "block");
                    $("#alert_info2").html(
                        `Mã OTP của bạn đã được gửi qua email: ${xhr["email"]}`
                    );
    
                    $("#forget_pass_form").css("display", "none");
                    $("#otp_form").css("display", "block");
                },
                error: function (xhr, text, err) {
                    $("#forget_pass_btn").attr("disabled", false);
                    $("#loader").css("display", "none");
                    $("#alert_danger").css("display", "block");
                    $("#alert_danger").html(xhr.responseJSON["message"]);
                },
            });
        });
    
        $("#otp_form").on("submit", function (e) {
            e.preventDefault();
    
            $("#alert_danger2").css("display", "none");
            $("#alert_info2").css("display", "none");
            $("#loader2").css("display", "block");
            $("#otp_btn").attr("disabled", true);
    
            $.ajax({
                type: "POST",
                url: "/users/validate-otp",
                data: $("form").serialize(),
                success: function (xhr, e, settings) {
                    $("#otp_btn").css("display", "none");
                    $("#loader2").css("display", "none");
                    $("#otp_form").css("display", "none");
                    $("#update_pass_otp").css("display", "block");
                    $("#alert_info2").html(xhr["message"]);
                    $("#update_pass_form_submit").val(xhr["email"])
                },
                error: function (xhr, text, err) {
                    $("#otp_btn").attr("disabled", false);
                    $("#loader2").css("display", "none");
                    $("#alert_danger2").css("display", "block");
                    $("#alert_danger2").html(xhr.responseJSON["message"]);
                },
            });
        });

        $("#update_pass_otp").on("submit", function (e) {
            e.preventDefault();
        
            $("#alert_danger_3").css("display", "none");
        
            if ($("#new_password").val() !== $("#confirm_new_password").val()) {
              $("#alert_danger_3").css("display", "block");
              $("#alert_danger_3").html("Mật khẩu không trùng khớp");
              return;
            }
            const email = $("#update_pass_form_submit").val()

            const form = new FormData();
            form.append("email", email);
            form.append("new_password", $("#new_password").val());
        
            $.ajax({
                type: "POST",
                url: "/users/resetPassword",
                timeout: 0,
                processData: false,
                contentType: false,
                data: form,
              success: function (xhr, e, settings) {
                $('#complete_block').css("display", "block");
                $('#update_pass_otp').css("display", "none");
                $("#alert_info_3").html("Đã đổi mật khẩu thành công quay vui lòng đăng nhập lại");
                // window.location = "/users/login";
              },
              error: function (xhr, text, err) {
                $("#alert_danger_3").css("display", "block");
                $("#alert_danger_3").html(JSON.parse(xhr['responseText'])["message"]);
              },
            });
        });
    }

    if(window.location.pathname === '/users/login') {
        $("#login_form").on("submit", function (e) {
            e.preventDefault();
        
            $("#alert_danger").css("display", "none");
        
            $.ajax({
              type: "POST",
              url: "/users/login",
              data: $("form").serialize(),
              success: function (xhr, e, settings) {
                if (xhr["message"] === "Sign in success") {
                  window.location = "/";
                } else if((xhr["message"] === "FIRST LOGIN")){
                    window.location = "/users/firstLogin";
                }
              },
              error: function (xhr, text, err) {
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(xhr.responseJSON["message"]);
              },
            });
        });
        
    }

    if(window.location.pathname === '/users/firstLogin') {
        $("#update_pass_form").on("submit", function (e) {
            e.preventDefault();
        
            $("#alert_danger_2").css("display", "none");
        
            if ($("#new_password").val() !== $("#confirm_new_password").val()) {
              $("#alert_danger_2").css("display", "block");
              $("#alert_danger_2").html("Mật khẩu không trùng khớp");
              return;
            }
        
            $.ajax({
              url: "/users/update-password",
              type: "POST",
              data: $("form").serialize(),
              success: function (xhr, e, settings) {
                window.location = "/";
              },
              error: function (xhr, text, err) {
                $("#alert_danger_2").css("display", "block");
                $("#alert_danger_2").html(JSON.parse(xhr['responseText'])["message"]);
              },
            });
        });
    }

    if(window.location.pathname === '/users/profile') {
        $("#update_id_card_form").on("submit", function (e) {
            e.preventDefault();
            let id = $('#update_id_card_form #update_id_card_btn').data('id')
      
            const form = new FormData(document.getElementById("update_id_card_form"));
            form.append("id", id);
      
            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            $("#update_id_card_btn").attr("disabled", true);
      
            $.ajax({
              url: "/account/updateIdCard",
              method: "POST",
              timeout: 0,
              processData: false,
              mimeType: "multipart/form-data",
              contentType: false,
              data: form,
              success: function (xhr, e, settings) {
                try {
                  xhr = JSON.parse(xhr);
                } catch (error) {
                  xhr = xhr
                }
                  $("#update_id_card_container").css("display", "none");
                  $("#alert_info").css("display", "block");
                  $("#alert_info").html(
                    "Cập nhật thông tin thành công"
                  );
                  $('#state-text').text("Chưa xác minh")
              },
              error: function (xhr, text, err) {
                $("#update_id_card_btn").attr("disabled", false);
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
              },
            });
        });
    }

    if(window.location.pathname === '/') {
        $('.money-format').html(parseInt($('.money-format').text()).toLocaleString('it-IT', {style: 'currency', currency: 'VND'}))

        $("#phone").keydown(function(event) {
            // Only allow backspace, delete and number
            if(event.keyCode !== 46 && event.keyCode !== 8 && (event.keyCode < 48 || event.keyCode > 57)){
              event.preventDefault(); 
            }
          });
          
        $("#signup_form").on("submit", function (e) {
            e.preventDefault();

            const form = new FormData(document.getElementById("signup_form"));

            $("#alert_danger").css("display", "none");
            $("#alert_info").css("display", "none");
            $("#loader").css("display", "block");
            $("#signup_btn").attr("disabled", true);

            $.ajax({
              url: "/users/signup",
              method: "POST",
              timeout: 0,
              processData: false,
              mimeType: "multipart/form-data",
              contentType: false,
              data: form,
              success: function (xhr, e, settings) {
                try {
                  xhr = JSON.parse(xhr);
                } catch (error) {
                  xhr = xhr
                }
                
                if (xhr["type"] === "mail") {
                  $("#signup_btn").attr("disabled", false);
                  $("#loader").css("display", "none");
                  $("#alert_info").css("display", "block");
                  $("#alert_info").html(
                    `Tài khoản người dùng của bạn đã được gửi qua email: ${xhr["email"]}`
                  );
                } else {
                  $("#signup_btn").attr("disabled", false);
                  $("#loader").css("display", "none");
                  $("#alert_info").css("display", "block");
                  $("#alert_info").html(
                    `Đăng ký tài khoản thành công nhưng email của bạn không hợp lệ <br/> Username: ${xhr["username"]}, Password: ${xhr["password"]}`
                  );
                }
              },
              error: function (xhr, text, err) {
                $("#signup_btn").attr("disabled", false);
                $("#loader").css("display", "none");
                $("#alert_danger").css("display", "block");
                $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
              },
            });
        });
    }
});
/*
    TYPE document: 
    1 -> Nạp tiền, 
    2 -> Rút tiền, 
    3 -> Chuyển tiền, 
    4 -> Mua thẻ điện thoại, 
    -1 -> UNKNOW
*/

function listActivatedAccount_viewDetail(type, history_id, transaction_id, user_id){
    switch (type) {
        case 1:
            listActivatedAccount_getDepositDetail(history_id, transaction_id, user_id);
            break;
        case 2:
            listActivatedAccount_getWithdrawDetail(history_id, transaction_id, user_id);
            break;
        case 3:
            listActivatedAccount_getTransferDetail(transaction_id, user_id);
            break;
        case 4:
            listActivatedAccount_getBuyCardDetail(history_id, transaction_id, user_id);
            break;
        default:
            break;
    }
}
                    
                    
function listActivatedAccount_getTransferDetail(transfer_id, user_id){
    $.ajax({
    url: `/transaction/transfer?transfer_id=${transfer_id}&user_id=${user_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
        try {
        xhr = JSON.parse(xhr);
        } catch (error) {
        xhr = xhr
        }
        
        const data = xhr[0];
        const htmlStr =
        `
        <div class="row">
            <div class="col-5">
            <p class="text-secondary font-weight-bold fon">CHUYỂN TIỀN</p>
            <p class="text-${parseInt(data['user_id']) === parseInt(user_id) ?"danger":"success"} font-weight-bold"> 
                ${parseInt(data['user_id']) === parseInt(user_id) ? "-": "+"} ${data['transfer_amount'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}
            </p>
            </div>
            <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                    parseInt(data['TRANSFER_STATUS']) === 1? "Thành công":
                    parseInt(data['TRANSFER_STATUS']) === 0? "Đang xử lý":
                    parseInt(data['TRANSFER_STATUS']) === -1? "Từ chối":
                    "Không rõ"
                }  
            </p>
            </div>
        </div>
        <div class="row mb-3">
            <p class="col-4">Mã giao dịch:</p>
            <div class="col-8">
            <p class="text-primary">
                ${data['transfer_id']}  
            </p>
            </div>
            <div class="col seperate"> </div>
        </div>
        <div class="row">
            <p class="col-4">Thời gian:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Số tiền:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['transfer_amount']}  
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Phí giao dịch:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['fee']??0}  
            </p>
            </div>
        </div>
        <div class="row mt-3">
            <p class="text-secondary font-weight-bold col">THÔNG TIN THÊM</p>
        </div>
        <div class="row">
            <p class="col-4">Người chuyển:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['name']}  
            </p>
            </div>
        </div><div class="row">
            <p class="col-4">Số điện thoại người chuyển:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['phone']}  
            </p>
            </div>
            <div class="col-12 seperate"></div>
        </div>
        <div class="row">
            <p class="col-4">Người nhận:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['recipient_name']}  
            </p>
            </div>
        </div><div class="row">
            <p class="col-4">Số điện thoại người nhận:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['recipient_phone']}  
            </p>
            </div>
            <div class="col-12 seperate"></div>
        </div>
        <div class="row mt-3">
            <p class="text-secondary font-weight-bold col-12">LỜI NHẮN</p>
            <p class="col">
            ${data['message']}  
            </p>
        </div>
        `;
        $("#modal_body").html(htmlStr);
        $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
        $("#alert_danger").css("display", "block");
        $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
    });
}

function listActivatedAccount_getDepositDetail(history_id, deposit_id, user_id){
    $.ajax({
    url: `/transaction/deposit?history_id=${history_id}&deposit_id=${deposit_id}&user_id=${user_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
        try {
        xhr = JSON.parse(xhr);
        } catch (error) {
        xhr = xhr
        }
        
        const data = xhr[0];
        const htmlStr =
        `<div class="row">
            <div class="col-8">
            <p class="text-secondary font-weight-bold fon">NẠP TIỀN</p>
            <p class="text-success font-weight-bold">+${data['deposit_amount']}</p>
            </div>
            <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                    parseInt(data['status']) === 1? "Thành công":
                    parseInt(data['status']) === 0? "Đang xử lý":
                    parseInt(data['status']) === -1? "Từ chối":
                    "Không rõ"
                }
            </p>
            </div>
        </div>
        <div class="row mb-3">
            <p class="col-4">Mã giao dịch:</p>
            <div class="col-8">
            <p class="text-primary">${data['deposit_id']}</p>
            </div>
            <div class="col seperate"></div>
        </div>
        <div class="row">
            <p class="col-4">Thời gian:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Số tiền:</p>
            <div class="col-8">
            <p class="font-weight-bold">${data['deposit_amount']}</p>
            </div>
        </div>
        `;
        $("#modal_body").html(htmlStr);
        $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
        $("#alert_danger").css("display", "block");
        $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
    });
}

function listActivatedAccount_getWithdrawDetail(history_id, withdraw_id, user_id){
    $.ajax({
    url: `/transaction/withdraw-detail?history_id=${history_id}&withdraw_id=${withdraw_id}&user_id=${user_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
        try {
        xhr = JSON.parse(xhr);
        } catch (error) {
        xhr = xhr
        }
        const data = xhr[0];
        const htmlStr =
        `<div class="row">
            <div class="col-8">
            <p class="text-secondary font-weight-bold fon">RÚT TIỀN</p>
            <p class="text-danger font-weight-bold">-${data['withdraw_amount']}</p>
            </div>
            <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                    parseInt(data['status']) === 1? "Thành công":
                    parseInt(data['status']) === 0? "Đang xử lý":
                    parseInt(data['status']) === -1? "Từ chối":
                    "Không rõ"
                }
            </p>
            </div>
        </div>
        <div class="row mb-3">
            <p class="col-4">Mã giao dịch:</p>
            <div class="col-8">
            <p class="text-primary">${data['withdraw_id']}</p>
            </div>
            <div class="col seperate"></div>
        </div>
        <div class="row">
            <p class="col-4">Thời gian:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Số tiền:</p>
            <div class="col-8">
            <p class="font-weight-bold">${data['withdraw_amount']}</p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Phí giao dịch:</p>
            <div class="col-8">
            <p class="font-weight-bold">${data['fee']}</p>
            </div>
        </div>
        <div class="row mt-3">
            <p class="text-secondary font-weight-bold col-12">LỜI NHẮN</p>
            <p class="col">${data['message']}</p>
        </div>
        `;
        $("#modal_body").html(htmlStr);
        $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
        $("#alert_danger").css("display", "block");
        $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
    });
}

function listActivatedAccount_getBuyCardDetail(history_id, buycard_id, user_id) {
    $.ajax({
    url: `/transaction/buy-card?history_id=${history_id}&buycard_id=${buycard_id}&user_id=${user_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
        try {
        xhr = JSON.parse(xhr);
        } catch (error) {
        xhr = xhr
        }
        const data = xhr[0];
        const listCardData = JSON.parse(data["note"]);
        let htmlStr = `
                    <div>
                    <div class="row">
                        <div class="col-8">
                        <p class="text-secondary font-weight-bold">MUA THẺ ĐIỆN THOẠI</p>
                        <p class="text-danger font-weight-bold">-${data['total'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
                        </div>
                        <div class="col-8">
                        <p class="text-success font-weight-bold">	&#8226; Thành công</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <p class="col-4">Mã giao dịch:</p>
                        <div class="col-8">
                        <p class="text-primary">${data['buy_id']}</p>
                        </div>
                        <div class="col seperate"> </div>
                    </div>
                    <div class="row">
                        <p class="col-4">Thời gian:</p>
                        <div class="col-8">
                        <p class="font-weight-bold">
                            ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
                        </p>
                        </div>
                    </div>
                    <div class="row">
                        <p class="col-4">Số tiền:</p>
                        <div class="col-8">
                        <p class="font-weight-bold">${data['total'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
                        </div>
                    </div>
                    <div class="row">
                        <p class="col-4">Phí giao dịch:</p>
                        <div class="col-8">
                        <p class="font-weight-bold">${data['fee']??0}</p>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <p class="text-secondary font-weight-bold col">THÔNG TIN THÊM</p>
                    </div>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">STT</th>
                                <th scope="col">Nhà mạng</th>
                                <th scope="col">Mã thẻ</th>
                                <th scope="col">Mệnh giá</th>
                            </tr>
                        </thead>
                        <tbody id="result_body">`;
        for(i in listCardData){
            htmlStr += 
            `<tr>
                <th scope="row">${parseInt(i) + 1}</th>
                <td>${listCardData[i]['network_name']}</td>
                <td>${listCardData[i]['card_number']}</td>
                <td>${listCardData[i]['denomination']}</td>
            </tr>`;
        }
        htmlStr += `</tbody></table></div>`;
        $("#modal_body").html(htmlStr);
        $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
        $("#alert_danger").css("display", "block");
        $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
    });
}

/*
    TYPE document: 
    1 -> Nạp tiền, 
    2 -> Rút tiền, 
    3 -> Chuyển tiền, 
    4 -> Mua thẻ điện thoại, 
    -1 -> UNKNOW
*/
function listWaitingTransaction_viewDetail(type, history_id, transaction_id, user_id){
    switch (type) {
    case 2:
        listWaitingTransaction_getWithdrawDetail(history_id, transaction_id, user_id);
        break;
    case 3:
        listWaitingTransaction_getTransferDetail(transaction_id, user_id);
        break;
    default:
        break;
    }
}
function listWaitingTransaction_getTransferDetail(transfer_id, user_id){
    $.ajax({
    url: `/transaction/transfer?transfer_id=${transfer_id}&user_id=${user_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
        try {
        xhr = JSON.parse(xhr);
        } catch (error) {
        xhr = xhr
        }
        
        const data = xhr[0];
        const htmlStr =
        `
        <div class="row">
            <div class="col-5">
            <p class="text-secondary font-weight-bold fon">CHUYỂN TIỀN</p>
            <p class="text-${parseInt(data['user_id']) === parseInt(user_id) ?"danger":"success"} font-weight-bold"> 
                ${parseInt(data['user_id']) === parseInt(user_id) ? "-": "+"} ${data['transfer_amount'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}
            </p>
            </div>
            <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                    parseInt(data['TRANSFER_STATUS']) === 1? "Thành công":
                    parseInt(data['TRANSFER_STATUS']) === 0? "Đang xử lý":
                    parseInt(data['TRANSFER_STATUS']) === -1? "Từ chối":
                    "Không rõ"
                }  
            </p>
            </div>
        </div>
        <div class="row mb-3">
            <p class="col-4">Mã giao dịch:</p>
            <div class="col-8">
            <p class="text-primary">
                ${data['transfer_id']}  
            </p>
            </div>
            <div class="col seperate"> </div>
        </div>
        <div class="row">
            <p class="col-4">Thời gian:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Số tiền:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['transfer_amount']}  
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Phí giao dịch:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['fee']??0}  
            </p>
            </div>
        </div>
        <div class="row mt-3">
            <p class="text-secondary font-weight-bold col">THÔNG TIN THÊM</p>
        </div>
        <div class="row">
            <p class="col-4">Người chuyển:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['name']}  
            </p>
            </div>
        </div><div class="row">
            <p class="col-4">Số điện thoại người chuyển:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['phone']}  
            </p>
            </div>
            <div class="col-12 seperate"></div>
        </div>
        <div class="row">
            <p class="col-4">Người nhận:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['recipient_name']}  
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Số điện thoại người nhận:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['recipient_phone']}  
            </p>
            </div>
            <div class="col-12 seperate"></div>
        </div>
        <div class="row mt-3">
            <p class="text-secondary font-weight-bold col-12">LỜI NHẮN</p>
            <p class="col">
            ${data['message']}  
            </p>
        </div>
        <div class="d-flex justify-content-around">
            <button type="button" class="btn btn-danger cancel-btn px-5" 
            onclick=listWaitingTransaction_disapproveTransfer(${data.transfer_id})
            data-toggle="modal" data-target="#disapprove-confirm">
            Hủy
            </button>
            <button type="button" class="btn btn-success confirm-btn px-5" 
            onclick=listWaitingTransaction_approveTransfer(${data.transfer_id})
            data-toggle="modal" data-target="#approve-confirm">
            Xác nhận
            </button>
        </div>
        `;
        $("#modal_body").html(htmlStr);
        $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
        $("#alert_danger").css("display", "block");
        $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
    });
}

function listWaitingTransaction_getWithdrawDetail(history_id, withdraw_id, user_id){
    $.ajax({
    url: `/transaction/withdraw-detail?history_id=${history_id}&withdraw_id=${withdraw_id}&user_id=${user_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
        try {
        xhr = JSON.parse(xhr);
        } catch (error) {
        xhr = xhr
        }
        const data = xhr[0];
        const htmlStr =
        `<div class="row">
            <div class="col-8">
            <p class="text-secondary font-weight-bold fon">RÚT TIỀN</p>
            <p class="text-danger font-weight-bold">-${data['withdraw_amount'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
            </div>
            <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                    parseInt(data['status']) === 1? "Thành công":
                    parseInt(data['status']) === 0? "Đang xử lý":
                    parseInt(data['status']) === -1? "Từ chối":
                    "Không rõ"
                }
            </p>
            </div>
        </div>
        <div class="row mb-3">
            <p class="col-4">Mã giao dịch:</p>
            <div class="col-8">
            <p class="text-primary">${data['withdraw_id']}</p>
            </div>
            <div class="col seperate"></div>
        </div>
        <div class="row">
            <p class="col-4">Thời gian:</p>
            <div class="col-8">
            <p class="font-weight-bold">
                ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Số tiền:</p>
            <div class="col-8">
            <p class="font-weight-bold">${data['withdraw_amount']}</p>
            </div>
        </div>
        <div class="row">
            <p class="col-4">Phí giao dịch:</p>
            <div class="col-8">
            <p class="font-weight-bold">${data['fee']}</p>
            </div>
        </div>
        <div class="row mt-3">
            <p class="text-secondary font-weight-bold col-12">LỜI NHẮN</p>
            <p class="col">${data['message']}</p>
        </div>
        <div class="d-flex justify-content-around">
            <button type="button" class="btn btn-danger cancel-btn px-5"
            onclick=listWaitingTransaction_disapproveWithdraw(${data.withdraw_id})
            data-toggle="modal" data-target="#disapprove-confirm">
            Hủy
            </button>
            <button type="button" class="btn btn-success confirm-btn px-5" 
            onclick=listWaitingTransaction_approveWithdraw(${data.withdraw_id})
            data-toggle="modal" data-target="#approve-confirm">
            Xác nhận
            </button>
        </div>
        `;
        $("#modal_body").html(htmlStr);
        $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
        $("#alert_danger").css("display", "block");
        $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
    });
}

function listWaitingTransaction_disapproveWithdraw(trans_id) {
    $('#disapprove-confirm .disapprove-btn').unbind().click(e => {
    e.preventDefault();

    const form = new FormData();
    form.append("trans_id", trans_id);

    $.ajax({
        url: "/transaction/disapproveWithdraw",
        method: "POST",
        timeout: 0,
        processData: false,
        mimeType: "multipart/form-data",
        contentType: false,
        data: form,
        success: function (xhr, e, settings) {
            try {
                xhr = JSON.parse(xhr);
            } catch (error) {
                xhr = xhr
            }

            $("#alert_info").css("display", "block");
            $("#alert_info").html(`Hủy giao dịch thành công`);
            $("#disapprove-confirm").modal('hide');
            $("#modal_view").modal('hide');
            $("tbody .row_type_2_id_" + trans_id).remove()
        },
        error: function (xhr, text, err) {
            $("#alert_danger2").css("display", "block");
            $("#alert_danger2").html(JSON.parse(xhr['responseText'])["message"]);
        },
    });
    })
}

function listWaitingTransaction_approveWithdraw(trans_id) {
    $('#approve-confirm .approve-btn').unbind().click(e => {
    e.preventDefault();

    const form = new FormData();
    form.append("trans_id", trans_id);

    $.ajax({
        url: "/transaction/approveWithdraw",
        method: "POST",
        timeout: 0,
        processData: false,
        mimeType: "multipart/form-data",
        contentType: false,
        data: form,
        success: function (xhr, e, settings) {
            try {
                xhr = JSON.parse(xhr);
            } catch (error) {
                xhr = xhr
            }

            $("#alert_info").css("display", "block");
            $("#alert_info").html(`Xác nhận giao dịch thành công`);
            $("#approve-confirm").modal('hide');
            $("#modal_view").modal('hide');
            $("tbody .row_type_2_id_" + trans_id).remove()
        },
        error: function (xhr, text, err) {
            $("#alert_danger").css("display", "block");
            $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
        },
    });
    })
}

function listWaitingTransaction_disapproveTransfer(trans_id) {
    $('#disapprove-confirm .disapprove-btn').unbind().click(e => {
    e.preventDefault();

    const form = new FormData();
    form.append("trans_id", trans_id);

    $.ajax({
        url: "/transfer/disapproveTransfer",
        method: "POST",
        timeout: 0,
        processData: false,
        mimeType: "multipart/form-data",
        contentType: false,
        data: form,
        success: function (xhr, e, settings) {
            try {
                xhr = JSON.parse(xhr);
            } catch (error) {
                xhr = xhr
            }

            $("#alert_info").css("display", "block");
            $("#alert_info").html(`Hủy giao dịch thành công`);
            $("#disapprove-confirm").modal('hide');
            $("#modal_view").modal('hide');
            $("tbody .row_type_3_id_" + trans_id).remove()
        },
        error: function (xhr, text, err) {
            $("#alert_danger2").css("display", "block");
            $("#alert_danger2").html(JSON.parse(xhr['responseText'])["message"]);
        },
    });
    })
}

function listWaitingTransaction_approveTransfer(trans_id) {
    $('#approve-confirm .approve-btn').unbind().click(e => {
    e.preventDefault();

    const form = new FormData();
    form.append("trans_id", trans_id);

    $.ajax({
        url: "/transfer/approvetransfer",
        method: "POST",
        timeout: 0,
        processData: false,
        mimeType: "multipart/form-data",
        contentType: false,
        data: form,
        success: function (xhr, e, settings) {
            try {
                xhr = JSON.parse(xhr);
            } catch (error) {
                xhr = xhr
            }

            $("#alert_info").css("display", "block");
            $("#alert_info").html(`Xác nhận giao dịch thành công`);
            $("#approve-confirm").modal('hide');
            $("#modal_view").modal('hide');
            $("tbody .row_type_3_id_" + trans_id).remove()
        },
        error: function (xhr, text, err) {
            $("#alert_danger").css("display", "block");
            $("#alert_danger").html(JSON.parse(xhr['responseText'])["message"]);
        },
    });
    })
}

/*
    TYPE document: 
    1 -> Nạp tiền, 
    2 -> Rút tiền, 
    3 -> Chuyển tiền, 
    4 -> Mua thẻ điện thoại, 
    -1 -> UNKNOW
*/
function transactionHistory_viewDetail(type, history_id, transaction_id, user_id){
    switch (type) {
        case 1:
            transactionHistory_getDepositDetail(history_id, transaction_id);
        break;
        case 2:
            transactionHistory_getWithdrawDetail(history_id, transaction_id);
        break;
        case 3:
            transactionHistory_getTransferDetail(transaction_id, user_id);
        break;
        case 4:
            transactionHistory_getBuyCardDetail(history_id, transaction_id);
        break;
        default:
        break;
    }
}
function transactionHistory_getTransferDetail(transfer_id, user_id){
$.ajax({
    url: `/transaction/transfer?transfer_id=${transfer_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
    try {
        xhr = JSON.parse(xhr);
    } catch (error) {
        xhr = xhr
    }
    
    const data = xhr[0];
    const htmlStr =
    `
        <div class="row">
        <div class="col-5">
            <p class="text-secondary font-weight-bold fon">CHUYỂN TIỀN</p>
            <p class="text-${parseInt(data['user_id']) === parseInt(user_id) ?"danger":"success"} font-weight-bold"> 
            ${parseInt(data['user_id']) === parseInt(user_id) ? "-": "+"} ${data['transfer_amount'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}
            </p>
        </div>
        <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
            ${
                parseInt(data['TRANSFER_STATUS']) === 1? "Thành công":
                parseInt(data['TRANSFER_STATUS']) === 0? "Đang xử lý":
                parseInt(data['TRANSFER_STATUS']) === -1? "Từ chối":
                "Không rõ"
                }  
            </p>
        </div>
        </div>
        <div class="row mb-3">
        <p class="col-4">Mã giao dịch:</p>
        <div class="col-8">
            <p class="text-primary">
            ${data['transfer_id']}  
            </p>
        </div>
        <div class="col seperate"> </div>
        </div>
        <div class="row">
        <p class="col-4">Thời gian:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
        </div>
        </div>
        <div class="row">
        <p class="col-4">Số tiền:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['transfer_amount']}  
            </p>
        </div>
        </div>
        <div class="row">
        <p class="col-4">Phí giao dịch:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['fee']??0}  
            </p>
        </div>
        </div>
        <div class="row mt-3">
        <p class="text-secondary font-weight-bold col">THÔNG TIN THÊM</p>
        </div>
        <div class="row">
        <p class="col-4">Người chuyển:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['name']}  
            </p>
        </div>
        </div><div class="row">
        <p class="col-4">Số điện thoại người chuyển:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['phone']}  
            </p>
        </div>
        <div class="col-12 seperate"></div>
        </div>
        <div class="row">
        <p class="col-4">Người nhận:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['recipient_name']}  
            </p>
        </div>
        </div><div class="row">
        <p class="col-4">Số điện thoại người nhận:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['recipient_phone']}  
            </p>
        </div>
        <div class="col-12 seperate"></div>
        </div>
        <div class="row mt-3">
        <p class="text-secondary font-weight-bold col-12">LỜI NHẮN</p>
        <p class="col">
            ${data['message']}  
        </p>
        </div>
    `;
    $("#modal_body").html(htmlStr);
    $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
    $("#alert_danger").css("display", "block");
    $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
});
}

function transactionHistory_getDepositDetail(history_id, deposit_id){
$.ajax({
    url: `/transaction/deposit?history_id=${history_id}&deposit_id=${deposit_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
    try {
        xhr = JSON.parse(xhr);
    } catch (error) {
        xhr = xhr
    }
    
    const data = xhr[0];
    const htmlStr =
    `<div class="row">
        <div class="col-8">
            <p class="text-secondary font-weight-bold fon">NẠP TIỀN</p>
            <p class="text-success font-weight-bold">+${data['deposit_amount'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
        </div>
        <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                parseInt(data['status']) === 1? "Thành công":
                parseInt(data['status']) === 0? "Đang xử lý":
                parseInt(data['status']) === -1? "Từ chối":
                "Không rõ"
                }
            </p>
        </div>
        </div>
        <div class="row mb-3">
        <p class="col-4">Mã giao dịch:</p>
        <div class="col-8">
            <p class="text-primary">${data['deposit_id']}</p>
        </div>
        <div class="col seperate"></div>
        </div>
        <div class="row">
        <p class="col-4">Thời gian:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
        </div>
        </div>
        <div class="row">
        <p class="col-4">Số tiền:</p>
        <div class="col-8">
            <p class="font-weight-bold">${data['deposit_amount']}</p>
        </div>
        </div>
    `;
    $("#modal_body").html(htmlStr);
    $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
    $("#alert_danger").css("display", "block");
    $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
});
}

function transactionHistory_getWithdrawDetail(history_id, withdraw_id){
$.ajax({
    url: `/transaction/withdraw-detail?history_id=${history_id}&withdraw_id=${withdraw_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
    try {
        xhr = JSON.parse(xhr);
    } catch (error) {
        xhr = xhr
    }
    const data = xhr[0];
    const htmlStr =
    `<div class="row">
        <div class="col-8">
            <p class="text-secondary font-weight-bold fon">RÚT TIỀN</p>
            <p class="text-danger font-weight-bold">-${data['withdraw_amount'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
        </div>
        <div class="col-4">
            <p class="text-primary font-weight-bold">	&#8226; 
                ${
                parseInt(data['status']) === 1? "Thành công":
                parseInt(data['status']) === 0? "Đang xử lý":
                parseInt(data['status']) === -1? "Từ chối":
                "Không rõ"
                }
            </p>
        </div>
        </div>
        <div class="row mb-3">
        <p class="col-4">Mã giao dịch:</p>
        <div class="col-8">
            <p class="text-primary">${data['withdraw_id']}</p>
        </div>
        <div class="col seperate"></div>
        </div>
        <div class="row">
        <p class="col-4">Thời gian:</p>
        <div class="col-8">
            <p class="font-weight-bold">
            ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
            </p>
        </div>
        </div>
        <div class="row">
        <p class="col-4">Số tiền:</p>
        <div class="col-8">
            <p class="font-weight-bold">${data['withdraw_amount']}</p>
        </div>
        </div>
        <div class="row">
        <p class="col-4">Phí giao dịch:</p>
        <div class="col-8">
            <p class="font-weight-bold">${data['fee']}</p>
        </div>
        </div>
        <div class="row mt-3">
        <p class="text-secondary font-weight-bold col-12">LỜI NHẮN</p>
        <p class="col">${data['message']}</p>
        </div>
    `;
    $("#modal_body").html(htmlStr);
    $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
    $("#alert_danger").css("display", "block");
    $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
});
}

function transactionHistory_getBuyCardDetail(history_id, buycard_id) {
$.ajax({
    url: `/transaction/buy-card?history_id=${history_id}&buycard_id=${buycard_id}`,
    method: "GET",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    success: function (xhr, e, settings) {
    try {
        xhr = JSON.parse(xhr);
    } catch (error) {
        xhr = xhr
    }
    const data = xhr[0];
    const listCardData = JSON.parse(data["note"]);
    let htmlStr = `
                <div>
                    <div class="row">
                    <div class="col-8">
                        <p class="text-secondary font-weight-bold">MUA THẺ ĐIỆN THOẠI</p>
                        <p class="text-danger font-weight-bold">-${data['total'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
                    </div>
                    <div class="col-8">
                        <p class="text-success font-weight-bold">	&#8226; Thành công</p>
                    </div>
                    </div>
                    <div class="row mb-3">
                    <p class="col-4">Mã giao dịch:</p>
                    <div class="col-8">
                        <p class="text-primary">${data['buy_id']}</p>
                    </div>
                    <div class="col seperate"> </div>
                    </div>
                    <div class="row">
                    <p class="col-4">Thời gian:</p>
                    <div class="col-8">
                        <p class="font-weight-bold">
                        ${data['created_on'] ? moment(data['created_on']).add(7, 'hours').format('DD/MM/YYYY - HH:mm') : "Không rõ"}
                        </p>
                    </div>
                    </div>
                    <div class="row">
                    <p class="col-4">Số tiền:</p>
                    <div class="col-8">
                        <p class="font-weight-bold">${data['total'].toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</p>
                    </div>
                    </div>
                    <div class="row">
                    <p class="col-4">Phí giao dịch:</p>
                    <div class="col-8">
                        <p class="font-weight-bold">${data['fee']??0}</p>
                    </div>
                    </div>
                    <div class="row mt-3">
                    <p class="text-secondary font-weight-bold col">THÔNG TIN THÊM</p>
                    </div>
                    
                    <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">STT</th>
                            <th scope="col">Nhà mạng</th>
                            <th scope="col">Mã thẻ</th>
                            <th scope="col">Mệnh giá</th>
                        </tr>
                    </thead>
                    <tbody id="result_body">`;
    for(i in listCardData){
        htmlStr += 
        `<tr>
            <th scope="row">${parseInt(i) + 1}</th>
            <td>${listCardData[i]['network_name']}</td>
            <td>${listCardData[i]['card_number']}</td>
            <td>${parseInt(listCardData[i]['denomination']).toLocaleString('it-IT', {style: 'currency', currency: 'VND'})}</td>
        </tr>`;
    }
    htmlStr += `</tbody></table></div>`;
    $("#modal_body").html(htmlStr);
    $("#modal_view").modal('show');
    },
    error: function (xhr, text, err) {
    $("#alert_danger").css("display", "block");
    $("#alert_danger").html(JSON.parse(xhr.responseText)["message"]);
    },
});
}
    
     