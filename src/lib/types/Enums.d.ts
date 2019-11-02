export const enum Events {
	Error = 'error',
	Warn = 'warn',
	Debug = 'debug',
	Verbose = 'verbose',
	Wtf = 'wtf',
	Warning = 'warning',
	KlasaReady = 'klasaReady',
	Log = 'log'
}

export const enum Databases {
	Users = 'users',
	Guilds = 'guilds'
}

export const enum BaseColors {
	Primary = 0x843DA4,
	Secondary = 0xDA004E
}

export const enum Time {
	Day = 1000 * 60 * 60 * 24,
	Hour = 1000 * 60 * 60,
	Millisecond = 1,
	Minute = 1000 * 60,
	Second = 1000,
	Week = 1000 * 60 * 60 * 24 * 7,
	Year = 1000 * 60 * 60 * 24 * 365
}

export const enum PermissionLevels {
	Everyone = 0,
	Staff = 4,
	Moderator = 5,
	Administrator = 6,
	ServerOwner = 7,
	BotOwner = 10
}
