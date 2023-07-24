jQuery(function ($) {
  //メール送信関数
  const sendMail_ajax = (send_email, subject_mail, message_mail, master_email, is_dataSave, is_retMail) => {
    //noceの取得
    const nonce = itmar_option.nonce;

    //ajaxの送り先
    const ajaxUrl = itmar_option.ajaxURL;
    $.ajax({
      type: 'POST',
      url: ajaxUrl,
      data: {
        'action': 'itmar_contact_send',
        'nonce': nonce,
        'email': send_email,
        'userName': $('input[name="user_name"]').val(),
        'subject': subject_mail,
        'message': message_mail,
        'reply_address': master_email,
        'is_dataSave': is_dataSave,
        'is_retMail': is_retMail,
      }
    }).done(function (data) {
      let ret_obj = JSON.parse(data);
      console.log(ret_obj)

    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
      console.log(XMLHttpRequest.status);
      console.log(textStatus);
      console.log(errorThrown.message);

    }).always(function () {

    });
  }

  //メッセージ再構築関数
  const message_rebuild = (message) => {
    const matches = message.match(/\[(.*?)\]/g);
    if (matches) {
      matches.forEach(match => {
        let rep_word = $(`[name="${match.slice(1, -1)}"]`).val()
        message = message.replace(match, rep_word);
      });
    }
    return message
  }
  //formの送信ボタンが押されたときの処理
  $('#guest_contact_form').on('submit', function (e) {
    e.preventDefault();
    let err_flg = false;//エラーフラグをセット
    //バリデーションチェック
    $(this).find('label').each(function () {
      let required = $(this).data('required');
      if (required) {
        if ($(this).next().val().length == 0) {
          let err_msg_elm = $('<div class="err_msg">入力必須の項目です</div>')
          $(this).parent().append(err_msg_elm);
          err_flg = true;
        } else {
          $(this).parent().find('.err_msg').remove()
        }
      }
    })
    let use_name = $('input[name="user_name"]').val()
    console.log(use_name);
    if (err_flg) return;//エラーフラグがtrueなら処理終了


    let master_email = $(this).data('master_mail');
    let subject_info = $(this).data('subject_info');
    let message_info = $(this).data('message_info');
    let is_dataSave = $(this).data('is_datasave');
    //message_infoの再構築
    message_info = message_rebuild(message_info);
    //通知メールの送信
    sendMail_ajax(master_email, subject_info, message_info, master_email, false, false);
    //自動応答メール
    let is_retmail = $(this).data('is_retmail');
    if (is_retmail) {
      let ret_inputName = $(this).data('ret_mail');
      let ret_email = $(`[name="${ret_inputName}"]`).val()
      let master_email = $(this).data('master_mail');
      let subject_ret = $(this).data('subject_ret');
      let message_ret = $(this).data('message_ret');
      //message_retの再構築
      message_ret = message_rebuild(message_ret);
      //自動応答メールの送信
      sendMail_ajax(ret_email, subject_ret, message_ret, master_email, is_dataSave, true);
    }

  });


});