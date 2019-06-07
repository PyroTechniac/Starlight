import { Serializer } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: number): Promise<Date> {
        return new Date(data);
    }

    public serialize(value: Date): number {
        return value.getTime();
    }

    public stringify(data: Date): string {
        return data.toDateString();
    }
}