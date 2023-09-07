jQuery(function ($) {
  //確認画面遷移のボタンの有効化
  $(document).ready(function () {
    // チェックボックスの状態を評価してsubmitボタンの状態を更新する関数
    function evaluateCheckboxes() {
      // 全てのチェックボックスが選択されているかチェック
      var allChecked = true;
      $('#to_confirm_form input[type="checkbox"][data-is_proceed="true"]').each(function () {
        if (!$(this).prop('checked')) {
          allChecked = false;
          return false; // eachループを抜ける
        }
      });

      if (!allChecked) {
        // 一つでもチェックされていなければ、submitボタンを無効化
        $('#to_confirm_form input[type="submit"]').prop('disabled', true);
      } else {
        // すべてチェックされていれば、submitボタンを有効化
        $('#to_confirm_form input[type="submit"]').prop('disabled', false);
      }
    };

    // ページ読み込み時に関数を実行
    evaluateCheckboxes();

    // チェックボックスの変更時に関数を実行
    $('#to_confirm_form input[type="checkbox"][data-is_proceed="true"]').on('change', evaluateCheckboxes)
  });

  //メール送信関数
  const sendMail_ajax = (send_email, subject_mail, message_mail, master_email, is_dataSave, is_retMail) => {
    //noceの取得
    const nonce = itmar_option.nonce;

    //ajaxの送り先
    const ajaxUrl = itmar_option.ajaxURL;
    return new Promise((resolve, reject) => {//Promiseを返す
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
        resolve(ret_obj);
      }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest.status);
        console.log(textStatus);
        console.log(errorThrown.message);
        reject(errorThrown);
      }).always(function () {

      });
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

  //プロセス更新関数
  const process_change = (figure_elm, set_flg) => {
    let classNames = figure_elm.attr('class').split(/\s+/);  // クラス名を空白文字で分割
    let wpBlockClasses = $.grep(classNames, function (className) {  // 'wp-block'で始まるクラス名を抽出
      return /^wp-block/.test(className);
    });
    let lis = $('.wp-block-itmar-design-process').find('li');
    let targetLis = lis.filter(function () {
      var liClasses = $(this).attr('class').split(/\s+/);  // li要素のクラス名を取得し配列にする
      return liClasses.some(function (liClass) {
        if (liClass === "") {
          return false;  // liClassが空文字であればfalseを返す
        }
        var result = wpBlockClasses.some(function (wpBlockClasse) {
          return wpBlockClasse.includes(liClass);
        });// wpBlockClassesにliのクラス名が含まれるかチェック
        return result;
      });
    });

    if (set_flg) {
      targetLis.addClass('ready');
    } else {
      targetLis.removeClass('ready');
    }

  }

  //formの確認画面へボタンが押されたときの処理
  $('#to_confirm_form').on('submit', function (e) {

    e.preventDefault();
    let err_flg = false;//エラーフラグをセット
    //バリデーションチェック
    $(this).find('label').each(function () {
      let required = $(this).data('required');
      if (required) {
        if ($(this).prev().val().length == 0) {
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
    process_change($(this).parent().next(), true);

    //確認データの表示
    let input_elm = $(this).find('input:not([type="submit"]), textarea')
    input_elm.each(function (index) {
      let input_val = $(this).val();
      $('#itmar_send_exec').find('tr').eq(index).find('td').text(input_val);
    });
  });


  //実行またはキャンセルボタンが押されたときの処理
  $('#itmar_send_exec').on('submit', function (e) {
    e.preventDefault();
    const click_id = e.originalEvent.submitter.id;
    //キャンセルボタンなら元に戻して終了
    if (click_id === $(this).data('cancel_id')) {
      $(this).parent().removeClass('appear');
      $(this).parent().prev().addClass('appear');
      //プログレスエリアの処理
      process_change($(this).parent(), false);
      return;
    }

    // Promiseを格納する配列を作成
    const promises = [];

    //親ブロックの情報取得
    let parent_block = $(this).parents('.wp-block-itmar-guest-contact-block');

    let master_email = parent_block.data('master_mail');
    let subject_info = parent_block.data('subject_info');
    let message_info = parent_block.data('message_info');
    let is_dataSave = parent_block.data('is_datasave');
    //message_infoの再構築
    message_info = message_rebuild(message_info);
    //通知メールの送信
    promises.push(sendMail_ajax(master_email, subject_info, message_info, master_email, false, false));
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
      promises.push(sendMail_ajax(ret_email, subject_ret, message_ret, master_email, is_dataSave, true));
    }

    let figure_elm = $(this).parent();

    // Promise.allSettledですべての非同期処理が完了するのを待つ
    Promise.allSettled(promises)
      .then((result) => {
        //送信結果の取得
        let all_result = result.reduce((acc, curr) => {
          if ('value' in curr) {
            Object.assign(acc, curr.value);
          }
          return acc;
        }, {});
        //表示エリアに表示
        let result_disp = $('#to_home p');
        result_disp.empty();
        $.each(all_result, function (key, value) {
          if (!(key === 'save' || key === 'error')) {
            let message = $('#to_home').data(`${key}_${value.status}`);
            let p = $('<p></p>').addClass(value.status).text(message);
            result_disp.append(p);
          } else if (key === 'error') {
            let p = $('<p></p>').addClass(value.status).text(value.message);
            result_disp.append(p);
          }
        });
      })
      .catch((error) => {
        // エラーハンドリング
        console.error("エラーが発生しました: ", error);
        let p = $('<p></p>').addClass('error').text("エラーが発生しました。");
        result_disp.append(p);
      })
      .finally(() => {
        //画面遷移
        figure_elm.removeClass('appear');
        figure_elm.next().addClass('appear');
        //プログレスエリアの処理
        process_change(figure_elm.next(), true);
      });

  });

  //ホームに戻るボタンの処理
  $('#to_home').on('submit', function (e) {
    e.preventDefault();
    let redirectUrl = $(this).data('selected_page');
    //画面遷移
    // $(this).parent().removeClass('appear');
    // $(this).parent().siblings('.first_appear').addClass('appear');
    //プログレスエリアの処理
    // $('.wp-block-itmar-design-process').find('li').each(function (index) {
    //   if (index > 0) {
    //     $(this).removeClass('ready');
    //   }
    // });
    //リダイレクト
    window.location.href = redirectUrl;
  });
});