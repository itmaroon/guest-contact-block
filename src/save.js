
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { borderProperty, radiusProperty, marginProperty, paddingProperty } from './styleProperty';

export default function save({ attributes }) {
	const {
		bgColor_form,
		bgGradient_form,
		radius_form,
		border_form,
		margin_form,
		padding_form,
		master_mail,
		subject_info,
		message_info,
		ret_mail,
		subject_ret,
		message_ret,
		is_retmail,
		is_dataSave
	} = attributes;

	//単色かグラデーションかの選択
	const bgColor = bgColor_form || bgGradient_form;


	//ブロックのスタイル設定
	const margin_obj = marginProperty(margin_form);
	const padding_obj = paddingProperty(padding_form);
	const radius_obj = radiusProperty(radius_form);
	const border_obj = borderProperty(border_form);
	const blockStyle = { background: bgColor, ...margin_obj, ...padding_obj, ...radius_obj, ...border_obj };

	return (
		<div {...useBlockProps.save({ style: blockStyle })}>
			<form
				id="guest_contact_form"
				data-master_mail={master_mail}
				data-subject_info={subject_info}
				data-message_info={message_info}
				data-ret_mail={ret_mail}
				data-subject_ret={subject_ret}
				data-message_ret={message_ret}
				data-is_retmail={is_retmail}
				data-is_datasave={is_dataSave}
			>
				<InnerBlocks.Content />
				<input type="submit" value="送信" />
			</form>
		</div>
	);
}
