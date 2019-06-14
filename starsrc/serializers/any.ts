import { Serializer } from 'klasa';

export default class extends Serializer {
    public async deserialize(data: any): Promise<any> {
        return data;
    }
}