<?php
/**
 * Plugin Name:       Guest Contact Block
 * Plugin URI:        https://itmaroon.net
 * Description:       メール送信フォームを備えたブロックです。
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            WebクリエイターITmaroon
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       guest-contact-block
 *
 * @package           itmar
 */


function itmar_contact_block_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'itmar_contact_block_block_init' );

function itmar_contact_block_add_js() {
	//管理画面以外（フロントエンド側でのみ読み込む）
	if (!is_admin()) {
		$script_path = plugin_dir_path(__FILE__) . 'assets/contact_block.js';
		wp_enqueue_script( 
			'contact_js_handle', 
			plugins_url( '/assets/contact_block.js', __FILE__ ), 
			array('jquery'), 
			filemtime($script_path),
			true
		);

		//nonceの生成
		wp_localize_script( 'contact_js_handle', 'itmar_option', array(
			'nonce' => wp_create_nonce('contact_send_nonce'),
			'ajaxURL' => esc_url( admin_url( 'admin-ajax.php', __FILE__ ) ),
		));
	}
}

add_action('enqueue_block_assets', 'itmar_contact_block_add_js');

//コンタクト情報の処理
function itmar_contact_send_ajax(){
  $nonce = $_REQUEST['nonce'];
  
  
	if ( wp_verify_nonce( $nonce, 'contact_send_nonce' ) ) {
    
    // メールの設定(無害化処理)
		$to = sanitize_email( $_POST['email'] );
		$subject = sanitize_text_field( $_POST['subject'] );
		$user_name = sanitize_text_field( $_POST['userName'] );
		$message = sanitize_textarea_field( $_POST['message'] );
		$reply = sanitize_email( $_POST['reply_address'] );
		$is_dataSave = filter_var($_POST['is_dataSave'], FILTER_VALIDATE_BOOLEAN);
		$is_retMail = filter_var($_POST['is_retMail'], FILTER_VALIDATE_BOOLEAN);
		$headers = 'From: Guest Contact Block <'.$reply.'>' . "\r\n";

		// バリデーション
		if ( ! is_email( $to ) || ! is_email( $reply ) || empty( $subject ) || empty( $message ) ) {
			echo json_encode(array('status' => 'error', 'message' => 'サーバーで入力項目に不備が発見されました。登録処理は中断されました。'));
			die();
		}

		//レスポンス用の配列を用意
		$response = array();

		//データの格納
		if($is_dataSave){
			//ユーザーの登録
			//既に登録されているかの確認
			$user_id = email_exists( $to );
			if(!$user_id){
				$user_data = array(
					'user_email' => $to,
					'user_login' => $to,  
					'display_name' => $user_name, 
					'role' => 'subscriber' 
				);
				$user_id = wp_insert_user( $user_data );
				
				if ( is_wp_error( $user_id ) ) {
					// ユーザーの作成に失敗した場合、エラーを処理します
					$response['save'] = array('status' => 'error', 'message' => $user_id->get_error_message());
				}else{
					//コンタクトデータを登録
					$new_post = array(
						'post_type'   => 'gcb_contact',//登録するカスタム投稿タイプ
						'post_status' => 'private',//公開ステータス（ここは個人情報なので非公開に）
						'post_title'  => 'お問合せデータ',//タイトルは分かりやすいものに
						'post_author' =>  $user_id
					);
					$post_id = wp_insert_post( $new_post, true );

					if ( is_wp_error( $post_id ) ) {
						// 投稿の作成に失敗した場合、エラーを処理します
						$response['save'] = array('status' => 'error', 'message' => $post_id->get_error_message());
						
					}else{
						update_post_meta( $post_id, 'send_date', current_time('mysql') );
						update_post_meta( $post_id, 'message', $message );

						$response['save'] = array('status' => 'success', 'message' => '受付処理が正常に完了しました。');
					}
				}
			}
		}

		// メールを送信
		if (wp_mail($to, $subject, $message, $headers)) {
			if($is_retMail){
				$response['mail'] = array('status' => 'success', 'message' => '自動応答メールが正常に送信されました。');
			}else{
				$response['mail'] = array('status' => 'success', 'message' => 'サイト管理者に正常に通知されました。');
			}
		} else {
			if($is_retMail){
				$response['mail'] = array('status' => 'error', 'message' => '自動応答メールの送信に失敗しました。');
			}else{
				$response['mail'] = array('status' => 'error', 'message' => 'サイト管理者への通知に失敗しました。');
			}
    		
		}
  }else {
		$response['error'] = array('status' => 'error', 'message' => '不正なリクエストです。');
	}
	//結果を通知して終了
	echo json_encode($response);
  die();
}
add_action( 'wp_ajax_itmar_contact_send', 'itmar_contact_send_ajax' );
add_action( 'wp_ajax_nopriv_itmar_contact_send', 'itmar_contact_send_ajax' );


