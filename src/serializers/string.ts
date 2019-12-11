import {Serializer, SerializerUpdateContext} from 'klasa';

export default class extends Serializer {
    public deserialize(data: unknown): string {
        return String(data);
    }

    public validate(data: unknown, {entry, language}: SerializerUpdateContext): string | null {
        const parsed = String(data);
        return Serializer.minOrMax(parsed.length, entry, language) ? parsed : null;
    }
}
