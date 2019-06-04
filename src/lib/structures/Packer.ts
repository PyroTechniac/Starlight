export class Packer {
    public type: string;

    public static TYPES = {
        d00d: 'message',
        cc00: 'simple.connect_request',
        cc01: 'simple.connect_response',
        dd00: 'simple.discovery_request',
        dd01: 'simple.discovery_response',
        dd02: 'simple.poweron'
    }
    public constructor(type: string) {

    }
}