export class StorageUtil {
    public static getNestedValue(obj: any, path: string[]): any {
        if (typeof obj === 'undefined') return;
        if (path.length === 0) return obj;

        const first: string = path.shift();
        if (typeof obj[first] === 'undefined') return;
        if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array)) return;

        return StorageUtil.getNestedValue(obj[first], path);
    }

    public static assignNestedValue(obj: any, path: string[], value: any): void {
        if (typeof obj !== 'object' || obj instanceof Array) {
            throw new Error(`Initial input type of '${typeof obj}' is not valid for nested assignment`);
        }

        if (path.length === 0) {
            throw new Error('Missing nested assignment path');
        }

        const first: string = path.shift();
        if (typeof obj[first] === 'undefined') obj[first] = {};
        if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array)) {
            throw new Error(`Target '${first}' is not valid for nested assignment`);
        }

        if (path.length === 0) obj[first] = value;
        else StorageUtil.assignNestedValue(obj[first], path, value);
    }

    public static removeNestedValue(obj: any, path: string[]): void {
        if (typeof obj !== 'object' || obj instanceof Array) return;
        if (path.length === 0) {
            throw new Error('Missing nested assignment path');
        }

        const first: string = path.shift();
        if (typeof obj[first] === 'undefined') return;
        if (path.length > 1 && (typeof obj[first] !== 'object' || obj[first] instanceof Array)) {
            return;
        }

        if (path.length === 0) delete obj[first];
        else StorageUtil.removeNestedValue(obj[first], path);
    }
}
