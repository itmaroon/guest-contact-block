
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { marginProperty, paddingProperty } from './styleProperty';

export default function save({ attributes }) {
	const {
		margin_value,
		padding_value,
		master_mail,
		subject_info,
		message_info,
		ret_mail,
		subject_ret,
		message_ret,
		is_retmail,
		is_dataSave
	} = attributes;

	//ブロックのスタイル設定
	const margin_obj = marginProperty(margin_value);
	const padding_obj = paddingProperty(padding_value);
	const blockStyle = { overflow: 'hidden', ...margin_obj, ...padding_obj }

	const blockProps = useBlockProps.save({
		style: blockStyle,
	});

	return (
		<div
			{...blockProps}
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
