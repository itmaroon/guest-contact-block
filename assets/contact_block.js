jQuery(function ($) {
  //formの送信ボタンが押されたときの処理
  $('#guest_contact_form').on('submit', function (e) {
    e.preventDefault();
    let master_email = $(this).data('master_mail');
    let subject_info = $(this).data('subject_info');
    let message_info = $(this).data('message_info');


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
        'email': master_email,
        'subject': subject_info,
        'message': message_info
      }
    }).done(function (data) {
      console.log(data)

    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
      console.log(XMLHttpRequest.status);
      console.log(textStatus);
      console.log(errorThrown.message);

    }).always(function () {

    });
  });


});