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
  $('#to_confirm_form').on('submit', function (e) {
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
    if (err_flg) return;//エラーフラグがtrueなら処理終了
    //次の画面に遷移
    $(this).parent().removeClass('appear');
    $(this).parent().next().addClass('appear');
    //プログレスエリアの処理
    let classNames = $(this).parent().next().attr('class').split(/\s+/);  // クラス名を空白文字で分割
    let wpBlockClasses = $.grep(classNames, function (className) {  // 'wp-block'で始まるクラス名を抽出
      return /^wp-block/.test(className);
    });

    let lis = $('.wp-block-itmar-design-process').find('li');
    lis.each(function () {
      var liClasses = $(this).attr('class').split(/\s+/);
      console.log('liClasses:', liClasses);
      console.log('wpBlockClasses[0]:', wpBlockClasses[0]);
      var some_result = liClasses.some(function (liClass) {
        var result = wpBlockClasses[0].includes(liClass);
        return result;
      });
      console.log('some_result:', some_result);
    });
    // var targetLis = lis.filter(function () {
    //   var liClasses = $(this).attr('class').split(/\s+/);  // li要素のクラス名を取得し配列にする
    //   return liClasses.some(function (liClass) {
    //     var result = wpBlockClasses[0].includes(liClass);  // 'wp-block'で始まるクラス名がliのクラス名を含むかチェック
    //     return result;
    //   });
    // });
    // console.log(targetLis);

    //確認データの表示
    let input_elm = $(this).find('input:not([type="submit"]), textarea')
    input_elm.each(function (index) {
      let input_val = $(this).val();
      $('#send_exec').find('tr').eq(index).find('td').text(input_val);
    });
  });

  //送信ボタンの実行かキャンセルか
  let send_click_btn;
  $("#send_exec_btn").click(function () {
    send_click_btn = "send_exec_btn";
  });

  $("#send_cancel_btn").click(function () {
    send_click_btn = "send_cancel_btn";
  });


  $('#send_exec').on('submit', function (e) {
    e.preventDefault();
    //キャンセルボタンなら元に戻して終了
    if (send_click_btn === 'send_cancel_btn') {
      $(this).parent().removeClass('appear');
      $(this).parent().prev().addClass('appear');
      return;
    }

    //親ブロックの情報取得
    let parent_block = $(this).parents('.wp-block-itmar-guest-contact-block');

    let master_email = parent_block.data('master_mail');
    let subject_info = parent_block.data('subject_info');
    let message_info = parent_block.data('message_info');
    let is_dataSave = parent_block.data('is_datasave');
    //message_infoの再構築
    message_info = message_rebuild(message_info);
    //通知メールの送信
    //sendMail_ajax(master_email, subject_info, message_info, master_email, false, false);
    //自動応答メール
    let is_retmail = parent_block.data('is_retmail');
    if (is_retmail) {
      let ret_inputName = parent_block.data('ret_mail');
      let ret_email = $(`[name="${ret_inputName}"]`).val()
      let master_email = parent_block.data('master_mail');
      let subject_ret = parent_block.data('subject_ret');
      let message_ret = parent_block.data('message_ret');
      //message_retの再構築
      message_ret = message_rebuild(message_ret);
      //自動応答メールの送信
      //sendMail_ajax(ret_email, subject_ret, message_ret, master_email, is_dataSave, true);
    }

    //画面遷移
    $(this).parent().removeClass('appear');
    $(this).parent().next().addClass('appear');
  });

  //ホームに戻るボタンの処理
  $('#to_home').on('submit', function (e) {
    e.preventDefault();
    //画面遷移
    $(this).parent().removeClass('appear');
    $(this).parent().siblings('.first_appear').addClass('appear');
  });
});