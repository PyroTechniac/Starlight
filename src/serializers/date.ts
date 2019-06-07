import { Serializer } from 'klasa';

export default class extends Serializer {
    // @ts-ignore
    public deserialize(data: number): Date {
        return new Date(data);
    }

    public serialize(value: Date): number {
        return value.getTime();
    }

    public stringify(data: Date): string {
        return data.toDateString();
    }
}