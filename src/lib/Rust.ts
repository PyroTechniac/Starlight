// This is for exporting all of the rust functions into a neatly wrapped module
// This also allows us to modify some behavior before it's used externally.
import * as native from '../../native';

export const neonVersion = native.version();
