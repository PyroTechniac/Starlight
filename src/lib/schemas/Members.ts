import { Schema } from 'klasa';
import { MemberSettings } from '../settings/MemberSettings';

export default new Schema()
	.add(MemberSettings.CommandUses, 'Integer', { 'default': 0, 'configurable': false })
	.add(MemberSettings.Points, 'Integer', { 'default': 0, 'configurable': false });
