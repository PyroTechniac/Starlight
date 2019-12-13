import { Schema } from 'klasa';

export default new Schema()
	.add('commandUses', 'Integer', { 'default': 0, 'configurable': false });
