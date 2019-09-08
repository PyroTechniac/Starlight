import { Serializer } from 'klasa';

export default class extends Serializer {

	public deserialize(data: string | number): Promise<Date> {
		return Promise.resolve(new Date(data));
	}

	public serialize(data: Date): number {
		return data.valueOf();
	}

	public stringify(data: Date): string {
		return data.toString();
	}

}
