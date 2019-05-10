export class Util {
	private static readonly SECOND: number = 1000;
	private static readonly MINUTE: number = 1000 * 60
	private static readonly HOUR: number = 1000 * 60 * 60;

	public static splitText(str: string, length: number): string {
		const x = str.substring(0, length).lastIndexOf(' ');
		const pos = x === -1 ? length : x;
		return str.substring(0, pos);
	}

	public static showSeconds(duration: number): string {
		const seconds = Math.floor(duration / this.SECOND) % 60;
		if (duration < this.MINUTE) return seconds === 1 ? 'a second' : `${seconds} seconds`;
		const minutes = Math.floor(duration / this.MINUTE) % 60;
		let output = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
		if (duration >= this.HOUR) {
			const hours = Math.floor(duration / this.HOUR)
			output = `${hours.toString().padStart(2, '0')}:${output};`
		}

		return output;
	}
}