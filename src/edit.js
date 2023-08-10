
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	RichText,
	useInnerBlocksProps,
	InspectorControls,
	__experimentalPanelColorGradientSettings as PanelColorGradientSettings,
	__experimentalBorderRadiusControl as BorderRadiusControl
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

import { useEffect, useState } from '@wordpress/element';
import { useSelect, dispatch } from '@wordpress/data';
import { borderProperty, radiusProperty, marginProperty, paddingProperty } from './styleProperty';

//スペースのリセットバリュー
const padding_resetValues = {
	top: '10px',
	left: '10px',
	right: '10px',
	bottom: '10px',
}

//ボーダーのリセットバリュー
const border_resetValues = {
	top: '0px',
	left: '0px',
	right: '0px',
	bottom: '0px',
}

const units = [
	{ value: 'px', label: 'px' },
	{ value: 'em', label: 'em' },
	{ value: 'rem', label: 'rem' },
];


export default function Edit({ attributes, setAttributes, clientId }) {
	const {

		master_mail,
		subject_info,
		message_info,
		ret_mail,
		subject_ret,
		message_ret,
		is_retmail,
		is_dataSave,
	} = attributes;

	//インナーブロックの制御
	const TEMPLATE = [//同一ブロックを２つ以上入れないこと（名称の文字列が重ならないこと）
		['itmar/design-process', {}],
		['itmar/input-figure-block', {}],
		['itmar/confirm-figure-block', {}],
		['itmar/thanks-figure-block', {}]
	];
	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			template: TEMPLATE,
			templateLock: true
		}
	);

	//インナーブロックを取得
	const innerBlocks = useSelect((select) => select('core/block-editor').getBlocks(clientId), [clientId]);
	const inputFigureBlock = innerBlocks.find(block => block.name === 'itmar/input-figure-block');
	const inputInnerBlocks = inputFigureBlock ? inputFigureBlock.innerBlocks : [];

	//Emailのバリデーション正規表現
	const mail_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	//編集中の値を確保するための状態変数
	const [master_mail_editing, setMasterMailValue] = useState(master_mail);
	const [subject_info_editing, setSubjectInfoValue] = useState(subject_info);
	const [message_info_editing, setMessageInfoValue] = useState(message_info);
	const [subject_ret_editing, setSubjectRetValue] = useState(subject_ret);
	const [message_ret_editing, setMessageRetValue] = useState(message_ret);

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title={__("Inquiry information notification email", 'itmar_guest_contact_block')} initialOpen={true} className="mailinfo_ctrl">
					<PanelRow>
						<TextControl
							label={__("Notification email address (sender)", 'itmar_guest_contact_block')}
							value={master_mail_editing}
							onChange={(newVal) => setMasterMailValue(newVal)}// 一時的な編集値として保存する
							onBlur={() => {
								//メールバリデーションチェック
								if (master_mail_editing.length == 0 || !mail_pattern.test(master_mail_editing)) {
									dispatch('core/notices').createNotice(
										'error',
										'通知先メールアドレスが空欄または形式が不正です。',
										{ type: 'snackbar', isDismissible: true, }
									);
									// バリデーションエラーがある場合、編集値を元の値にリセットする
									setMasterMailValue(master_mail);
								} else {
									// バリデーションが成功した場合、編集値を確定する
									setAttributes({ master_mail: master_mail_editing });
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label={__("Notification email subject", 'itmar_guest_contact_block')}
							value={subject_info_editing}
							onChange={(newVal) => setSubjectInfoValue(newVal)}// 一時的な編集値として保存する
							onBlur={() => {
								if (subject_info_editing.length == 0) {
									dispatch('core/notices').createNotice(
										'error',
										'通知メールの標題は空欄にしないでください。',
										{ type: 'snackbar', isDismissible: true, }
									);
									// バリデーションエラーがある場合、編集値を元の値にリセットする
									setSubjectInfoValue(subject_info);
								} else {
									// バリデーションが成功した場合、編集値を確定する
									setAttributes({ subject_info: subject_info_editing });
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<TextareaControl
							label="通知メール本文"
							value={message_info_editing}
							onChange={(newVal) => setMessageInfoValue(newVal)}// 一時的な編集値として保存する
							onBlur={() => {
								if (message_info_editing.length == 0) {
									dispatch('core/notices').createNotice(
										'error',
										'通知メールの本文は空欄にしないでください。',
										{ type: 'snackbar', isDismissible: true, }
									);
									// バリデーションエラーがある場合、編集値を元の値にリセットする
									setMessageInfoValue(message_info);
								} else {
									// バリデーションが成功した場合、編集値を確定する
									setAttributes({ message_info: message_info_editing });
								}
							}}
							rows="5"
							help="下に表示されている入力項目をクリックすると本文に引用されます。"
						/>
					</PanelRow>
					{inputInnerBlocks.map((input_elm, index) => {

						const actions = [
							{
								label: '👆',
								onClick: () => {
									const newVal = `${message_info}[${input_elm.attributes.inputName}]`
									setMessageInfoValue(newVal)
									setAttributes({ message_info: newVal })
								}
							},
						];
						return (
							<Notice key={index} actions={actions} isDismissible={false}>
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
							{inputInnerBlocks.map((input_elm, index) => {
								if (input_elm.attributes.inputType === 'email') {
									const actions = [
										{
											label: '👆',
											onClick: () => {
												setAttributes({ ret_mail: input_elm.attributes.inputName })
											}
										},
									];
									return (
										<Notice key={index} actions={actions} isDismissible={false}>
											<p>{input_elm.attributes.labelContent}</p>
										</Notice>
									);
								}
							})}
							<PanelRow>
								<TextControl
									label="自動応答メールの標題"
									value={subject_ret_editing}
									onChange={(newVal) => setSubjectRetValue(newVal)}// 一時的な編集値として保存する
									onBlur={() => {
										if (subject_ret_editing.length == 0) {
											dispatch('core/notices').createNotice(
												'error',
												'通知メールの標題は空欄にしないでください。',
												{ type: 'snackbar', isDismissible: true, }
											);
											// バリデーションエラーがある場合、編集値を元の値にリセットする
											setSubjectRetValue(subject_ret);
										} else {
											// バリデーションが成功した場合、編集値を確定する
											setAttributes({ subject_ret: subject_ret_editing });
										}
									}}
								/>
							</PanelRow>
							<PanelRow>
								<TextareaControl
									label="自動応答メール本文"
									value={message_ret_editing}
									onChange={(newVal) => setMessageRetValue(newVal)}// 一時的な編集値として保存する
									onBlur={() => {
										if (message_ret_editing.length == 0) {
											dispatch('core/notices').createNotice(
												'error',
												'通知メールの標題は空欄にしないでください。',
												{ type: 'snackbar', isDismissible: true, }
											);
											// バリデーションエラーがある場合、編集値を元の値にリセットする
											setMessageRetValue(message_info);
										} else {
											// バリデーションが成功した場合、編集値を確定する
											setAttributes({ message_ret: message_ret_editing });
										}
									}}
									rows="5"
									help="下に表示されている入力項目をクリックすると本文に引用されます。"
								/>
							</PanelRow>
							{inputInnerBlocks.map((input_elm, index) => {

								const actions = [
									{
										label: '👆',
										onClick: () => {
											const newVal = `${message_ret}[${input_elm.attributes.inputName}]`
											setMessageRetValue(newVal)
											setAttributes({ message_ret: newVal })
										}
									},
								];
								return (
									<Notice key={index} actions={actions} isDismissible={false}>
										<p>{input_elm.attributes.labelContent}</p>
									</Notice>
								);
							})}
							<PanelRow>
								<ToggleControl
									label='応答の内容をDBに保存する'
									checked={is_dataSave}
									onChange={(newVal) => setAttributes({ is_dataSave: newVal })}
								/>

							</PanelRow>
						</>
					}
				</PanelBody>

			</InspectorControls>

			<div {...useBlockProps()}>
				<div {...innerBlocksProps}></div>
			</div>

		</>
	);
}
