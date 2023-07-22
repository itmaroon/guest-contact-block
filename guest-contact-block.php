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

//メール送信関数
function itmar_contact_send_ajax(){
  $nonce = $_REQUEST['nonce'];
  
  
	if ( wp_verify_nonce( $nonce, 'contact_send_nonce' ) ) {
    
    // メールの設定
		$to = $_POST['email'];
		$subject = $_POST['subject'];
		$message = $_POST['message'];
		$headers = 'From: Guest Contact Block <'.$to.'>' . "\r\n";

		// メールを送信
		if (wp_mail($to, $subject, $message, $headers)) {
    	echo 'メールが正常に送信されました';
		} else {
    	echo 'メールの送信に失敗しました';
		}
  }
  die();
}
add_action( 'wp_ajax_itmar_contact_send', 'itmar_contact_send_ajax' );
add_action( 'wp_ajax_nopriv_itmar_contact_send', 'itmar_contact_send_ajax' );
