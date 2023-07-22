
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	Button,
	Panel,
	PanelBody,
	PanelRow,
	ToggleControl,
	TextareaControl,
	Notice,
	RangeControl,
	RadioControl,
	TextControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBorderBoxControl as BorderBoxControl
} from '@wordpress/components';

import './editor.scss';

import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

//Submitを無効化する関数
const handleSubmit = (e) => {
	e.preventDefault();
};

const measureTextWidth = (text, fontSize, fontFamily) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	context.font = `${fontSize} ${fontFamily}`;
	const metrics = context.measureText(text);
	return metrics.width;
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		master_mail,
		subject_info,
		message_info,
		ret_mail,
		subject_ret,
		message_ret,
		is_retmail,
	} = attributes;

	const innerBlocks = useSelect((select) => select('core/block-editor').getBlocks(clientId), [clientId]);

	useEffect(() => {
		const maxNum = innerBlocks.reduce((max, block) => {
			return Math.max(max, measureTextWidth(block.attributes.labelContent, block.attributes.font_style_label.fontSize, block.attributes.font_style_label.fontFamily));
		}, Number.MIN_SAFE_INTEGER);
		setAttributes({ label_width: `${Math.round(maxNum)}px` })
	}, [innerBlocks]);

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title="お問合せ情報通知メール" initialOpen={true} className="mailinfo_ctrl">
					<PanelRow>
						<TextControl
							label="通知先メールアドレス"
							value={master_mail}
							isPressEnterToChange
							onChange={(newVal) => setAttributes({ master_mail: newVal })}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label="通知メールの標題"
							value={subject_info}
							isPressEnterToChange
							onChange={(newVal) => setAttributes({ subject_info: newVal })}
						/>
					</PanelRow>
					<PanelRow>
						<TextareaControl
							label="通知メール本文"
							value={message_info}
							onChange={(newVal) => setAttributes({ message_info: newVal })}
							rows="5"
							help="下に表示されている入力項目をクリックすると本文に引用されます。"
						/>
					</PanelRow>
					{innerBlocks.map(input_elm => {
						const actions = [
							{
								label: '👆',
								//onClick: () => console.log(input_elm.attributes.inputName)
								onClick: ((input) => {
									return () => console.log(input.attributes.inputName)
								})(input_elm),
							},
						];
						return (
							<Notice actions={actions} isDismissible={false}>
								<p>{input_elm.attributes.labelContent}</p>
							</Notice>
						);
					})}
				</PanelBody>
				<PanelBody title="自動応答メール" initialOpen={true} className="mailinfo_ctrl">
					<PanelRow>
						<ToggleControl
							label='自動応答メールを発信する'
							checked={is_retmail}
							onChange={(newVal) => setAttributes({ is_retmail: newVal })}
						/>

					</PanelRow>
					{is_retmail &&
						<>
							<PanelRow>
								<TextControl
									label="応答先メールアドレス"
									value={ret_mail}
									isPressEnterToChange
									onChange={(newVal) => setAttributes({ ret_mail: newVal })}
									help="下に表示されているメールアドレスをクリックすると応答先がセットされます"
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label="自動応答メールの標題"
									value={subject_ret}
									isPressEnterToChange
									onChange={(newVal) => setAttributes({ subject_ret: newVal })}
								/>
							</PanelRow>
							<PanelRow>
								<TextareaControl
									label="自動応答メール本文"
									value={message_ret}
									onChange={(newVal) => setAttributes({ message_ret: newVal })}
									rows="5"
									help="下に表示されている入力項目をクリックすると本文に引用されます。"
								/>
							</PanelRow>
						</>

					}

				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				<form onSubmit={handleSubmit}>
					<div {...useInnerBlocksProps()}></div>
					<input type="submit" value="送信" />
				</form>
			</div>
		</>
	);
}
