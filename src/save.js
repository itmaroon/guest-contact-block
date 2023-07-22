
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';


export default function save({ attributes }) {
	const {
		master_mail,
		subject_info,
		message_info,
		ret_mail,
		subject_ret,
		message_ret,
		is_retmail,
	} = attributes;

	return (
		<div {...useBlockProps.save()}>
			<form
				id="guest_contact_form"
				data-master_mail={master_mail}
				data-subject_info={subject_info}
				data-message_info={message_info}
				data-ret_mail={ret_mail}
				data-subject_ret={subject_ret}
				data-message_ret={message_ret}
				data-is_retmail={is_retmail}
			>
				<InnerBlocks.Content />
				<input type="submit" value="送信" />
			</form>
		</div>
	);
}
