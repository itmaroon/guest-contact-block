import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import { ReactComponent as Contact } from './envelopes-bulk-solid.svg';


/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';


registerBlockType(metadata.name, {
	icon: <Contact />,
	edit: Edit,
	save,
});
