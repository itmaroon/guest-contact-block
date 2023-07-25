
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
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


//Submitを無効化する関数
const handleSubmit = (e) => {
	e.preventDefault();
};
//要素幅を計測する関数
const measureTextWidth = (text, fontSize, fontFamily) => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	context.font = `${fontSize} ${fontFamily}`;
	const metrics = context.measureText(text);
	return metrics.width;
}

export default function Edit({ attributes, setAttributes, clientId }) {
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
		is_dataSave,
	} = attributes;

	//単色かグラデーションかの選択
	const bgColor = bgColor_form || bgGradient_form;


	//ブロックのスタイル設定
	const margin_obj = marginProperty(margin_form);
	const padding_obj = paddingProperty(padding_form);
	const radius_obj = radiusProperty(radius_form);
	const border_obj = borderProperty(border_form);
	const blockStyle = { background: bgColor, ...margin_obj, ...padding_obj, ...radius_obj, ...border_obj };

	//Emailのバリデーション正規表現
	const mail_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	//編集中の値を確保するための状態変数
	const [master_mail_editing, setMasterMailValue] = useState(master_mail);
	const [subject_info_editing, setSubjectInfoValue] = useState(subject_info);
	const [message_info_editing, setMessageInfoValue] = useState(message_info);
	const [subject_ret_editing, setSubjectRetValue] = useState(subject_ret);
	const [message_ret_editing, setMessageRetValue] = useState(message_ret);

	//インナーブロックの制御
	const TEMPLATE = [
		['itmar/design-text-ctrl', { inputName: 'user_name', labelContent: 'お名前', required: { flg: true, display: "*" } }],
		['itmar/design-text-ctrl', { inputName: 'email', labelContent: 'メールアドレス', inputType: 'email', required: { flg: true, display: "*" } }]
	];
	const innerBlocksProps = useInnerBlocksProps(
		{},
		{
			allowedBlocks: ['itmar/design-text-ctrl'],
			template: TEMPLATE,
			templateLock: false
		}
	);

	//インナーブロックを取得
	const innerBlocks = useSelect((select) => select('core/block-editor').getBlocks(clientId), [clientId]);

	//インナーブロックのラベル幅を取得
	useEffect(() => {
		const maxNum = innerBlocks.reduce((max, block) => {
			//必須項目の表示を設定
			const dispLabel = block.attributes.required.flg ? `${block.attributes.labelContent}(${block.attributes.required.display})` : block.attributes.labelContent;
			return Math.max(max, measureTextWidth(dispLabel, block.attributes.font_style_label.fontSize, block.attributes.font_style_label.fontFamily));
		}, Number.MIN_SAFE_INTEGER);
		setAttributes({ label_width: `${Math.round(maxNum)}px` })
	}, [innerBlocks]);

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title="お問合せ情報通知メール" initialOpen={true} className="mailinfo_ctrl">
					<PanelRow>
						<TextControl
							label="通知先メールアドレス（送信元）"
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
							label="通知メールの標題"
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
					{innerBlocks.map((input_elm, index) => {

						const actions = [
							{
								label: '👆',
								onClick: () => {
									const newVal = `${message_info}[${input_elm.attributes.inputName}]`
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
							{innerBlocks.map((input_elm, index) => {
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
							{innerBlocks.map((input_elm, index) => {

								const actions = [
									{
										label: '👆',
										onClick: () => {
											const newVal = `${message_ret}[${input_elm.attributes.inputName}]`
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

			<InspectorControls group="styles">
				<PanelBody title="送信フォームスタイル設定" initialOpen={true} className="form_design_ctrl">

					<PanelColorGradientSettings
						title={__(" Background Color Setting")}
						settings={[
							{
								colorValue: bgColor_form,
								gradientValue: bgGradient_form,

								label: __("Choose Background color"),
								onColorChange: (newValue) => setAttributes({ bgColor_form: newValue }),
								onGradientChange: (newValue) => setAttributes({ bgGradient_form: newValue }),
							},
						]}
					/>
					<PanelBody title="ボーダー設定" initialOpen={false} className="border_design_ctrl">
						<BorderBoxControl

							onChange={(newValue) => setAttributes({ border_form: newValue })}
							value={border_form}
							allowReset={true}	// リセットの可否
							resetValues={border_resetValues}	// リセット時の値
						/>
						<BorderRadiusControl
							values={radius_form}
							onChange={(newBrVal) =>
								setAttributes({ radius_form: typeof newBrVal === 'string' ? { "value": newBrVal } : newBrVal })}
						/>
					</PanelBody>
					<BoxControl
						label="マージン設定"
						values={margin_form}
						onChange={value => setAttributes({ margin_form: value })}
						units={units}	// 許可する単位
						allowReset={true}	// リセットの可否
						resetValues={padding_resetValues}	// リセット時の値

					/>
					<BoxControl
						label="パティング設定"
						values={padding_form}
						onChange={value => setAttributes({ padding_form: value })}
						units={units}	// 許可する単位
						allowReset={true}	// リセットの可否
						resetValues={padding_resetValues}	// リセット時の値

					/>

				</PanelBody>

			</InspectorControls>

			<div {...useBlockProps({ style: blockStyle })}>

				<fieldset class="data_input_area">
					<form onSubmit={handleSubmit}>
						<div {...innerBlocksProps}></div>
						<input type="submit" value="確認画面へ" />
					</form>
				</fieldset>
				<fieldset class="data_confirm_area">

					<table>
						{innerBlocks.map((input_elm, index) => {
							return (
								<tr key={index}>
									<td>{input_elm.attributes.labelContent}</td>
									<td>{input_elm.attributes.inputValue}</td>
								</tr>
							);
						})}

					</table>
					<input type="submit" value="送信" />
				</fieldset>
				<fieldset class="result_disp_area">

				</fieldset>
			</div>
		</>
	);
}
