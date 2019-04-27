export class Iterable {
    public peeked: boolean = false;
    public peekedAt: any = null;
    public constructor(public iterator: Iterator<any>) {}
}
