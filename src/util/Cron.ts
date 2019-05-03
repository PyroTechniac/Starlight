import { Cron as CRON, DAY, tokenRegex } from './Constants';
const { allowedNum, partRegex, wildcardRegex, predefined, tokens } = CRON;

type partRegexResult = [any, string, number | string, number | string, number | string]

export class Cron {
	public cron: string
	public constructor(cron: string) {
		this.cron = cron.toLowerCase();
	}

	private static _normalize(cron: string): string {
		if (cron in predefined) return predefined[cron];
		const now = new Date();
		//@ts-ignore
		cron = cron.split(' ').map((val, i) => val.replace(wildcardRegex, match => {
			if (match === 'h') return Math.floor(Math.random() * (allowedNum[i][1] + 1))
			if (match === '?') {
				switch (i) {
					case 0: return now.getUTCMinutes();
					case 1: return now.getUTCHours();
					case 2: return now.getUTCDate();
					case 3: return now.getUTCMonth();
					case 4: return now.getUTCDay();
				}
			}
			return match;
		})).join(' ');
		return cron.replace(tokenRegex, match => tokens[match]);
	}

	private static _parseString(cron: string): number[][] {
		const parts = cron.split(' ');
		if (parts.length !== 5) throw new Error('Invalid Cron Provided');
		return parts.map(this._parsePart);
	}

	private static _parsePart(cronPart: string, id: number): number[] {
		if (cronPart.includes(',')) {
			const res = [];
			for (const part of cronPart.split(',')) res.push(...this._parsePart(part, id))
			return [...new Set(res)].sort((a, b) => a - b);
		}

		// @ts-ignore
		let [, wild, min, max, step]: partRegexResult = partRegex.exec(cronPart);

		if (wild) [min, max] = allowedNum[id];
		else if (!max && !step) return [Number.parseInt(min)];
		// @ts-ignore
		return Cron._range(...[parseInt(min), parseInt(max) || allowedNum[id][1]].sort((a, b) => a - b), parseInt(step) || 1);
	}

	private static _range(min: number, max: number, step: number): number[] {
		return new Array(Math.floor((max - min) / step) + 1).fill(0).map((val, i) => min + (i * step));
	}
}