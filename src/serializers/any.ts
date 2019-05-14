import { Serializer } from 'klasa';

export default class AnySerializer extends Serializer {
    public deserialize(data: any): any {
        return data;
    }
}