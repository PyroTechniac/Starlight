export class PreciseTimeout {

	private readonly endsAt: number;
	private stopped = false;
	private resolve: (() => void) | null = null;
	private timeout: NodeJS.Timeout | null = null;

	public constructor(time: number) {
		this.endsAt = Date.now() + time;
	}

	public async run(): Promise<boolean> {
		if (this.stopped) return false;

		const cb = (): void => {
			if (Date.now() + 10 >= this.endsAt) this.stopped = true;
			this.resolve!();
			this.resolve = null;
		};

		while (!this.stopped) {
			await new Promise<void>((resolve): void => {
				this.resolve = resolve;
				this.timeout = setTimeout(cb, Date.now() - this.endsAt + 10);
			});
		}

		return true;
	}

	public stop(): boolean {
		if (this.stopped) return false;

		this.stopped = true;
		if (this.timeout) clearTimeout(this.timeout);
		if (this.resolve) this.resolve();
		return true;
	}

}
