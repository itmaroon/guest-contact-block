
import { useBlockProps, InnerBlocks, RichText } from '@wordpress/block-editor';


export default function save({ attributes }) {
	const {
		master_mail,
		subject_info,
		message_info,
		ret_mail,
		subject_ret,
		message_ret,
		is_retmail,
		is_dataSave
	} = attributes;


	return (
		<div
			{...useBlockProps.save()}
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
		</div>
	);
}
