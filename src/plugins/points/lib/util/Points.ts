import { Client, RateLimit, KlasaUser as User } from 'klasa';

export class Points {
    public user: User;

    public client: Client

    public readonly options: any

    public limiter: RateLimit;

    public constructor(user: User, client?: Client) {
        this.user = user;
        this.client = client ? client : user.client as Client;
        this.options = this.client.options.points;
        this.limiter = new RateLimit(
            this.options.pointAcquisitionBucket,
            this.options.cooldown
        );

        this.limiter.reset();
    }

    public genPoints(): number {
        return Math.floor(Math.random() * (this.options.maxAdd - this.options.minAdd + 1)) + this.options.minAdd;
    }
}