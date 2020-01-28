export const enum Events {
	Error = 'error',
	Warn = 'warn',
	Debug = 'debug',
	Verbose = 'verbose',
	Wtf = 'wtf',
	Warning = 'warning',
	KlasaReady = 'klasaReady',
	Log = 'log',
	CommandSuccess = 'commandSuccess',
	CommandInhibited = 'commandInhibited',
	CommandError = 'commandError',
	TaskScheduled = 'taskScheduled',
	TaskFound = 'taskFound',
	GuildMemberAdd = 'guildMemberAdd',
	GuildMemberRemove = 'guildMemberRemove',
	GuildCreate = 'guildCreate'
}

export const enum Databases {
	Users = 'users',
	Guilds = 'guilds',
	ClientStorage = 'clientStorage',
	Texts = 'textChannels',
	Voices = 'voiceChannels',
	Categories = 'categoryChannels',
	Members = 'members'
}

export const enum APIErrors {
	UnknownAccount = 10001,
	UnknownApplication = 10002,
	UnknownChannel = 10003,
	UnknownGuild = 10004,
	UnknownIntegration = 10005,
	UnknownInvite = 10006,
	UnknownMember = 10007,
	UnknownMessage = 10008,
	UnknownOverwrite = 10009,
	UnknownProvider = 10010,
	UnknownRole = 10011,
	UnknownToken = 10012,
	UnknownUser = 10013,
	UnknownEmoji = 10014,
	UnknownWebhook = 10015,
	BotProhibitedEndpoint = 20001,
	BotOnlyEndpoint = 20002,
	MaximumGuilds = 30001,
	MaximumFriends = 30002,
	MaximumPins = 30003,
	MaximumRoles = 30005,
	MaximumReactions = 30010,
	MaximumChannels = 30013,
	MaximumInvites = 30016,
	Unauthorized = 40001,
	UserBanned = 40007,
	MissingAccess = 50001,
	InvalidAccountType = 50002,
	CannotExecuteOnDM = 50003,
	EmbedDisabled = 50004,
	CannotEditMessageByOther = 50005,
	CannotSendEmptyMessage = 50006,
	CannotMessageUser = 50007,
	CannotSendMessagesInVoiceChannel = 50008,
	ChannelVerificationLevelTooHigh = 50009,
	Oauth2ApplicationBotAbsent = 50010,
	MaximumOauth2Applications = 50011,
	InvalidOauthState = 50012,
	MissingPermissions = 50013,
	InvalidAuthenticationToken = 50014,
	NoteTooLong = 50015,
	InvalidBulkDeleteQuantity = 50016,
	CannotPinMessageInOtherChannel = 50019,
	InvalidOrTakenInviteCode = 50020,
	CannotExecuteOnSystemMessage = 50021,
	InvalidOauthToken = 50025,
	BulkDeleteMessageTooOld = 50034,
	InvalidFormBody = 50035,
	InviteAcceptedToGuildNotContainingBot = 50036,
	InvalidApiVersion = 50041,
	ReactionBlocked = 90001,
	ResourceOverloaded = 130000
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

export const enum CronTimes {
	Hourly = '0 * * * *',
	Daily = '0 0 * * *',
	Weekly = '0 0 * * 0',
	Monthly = '0 0 1 * *',
	Yearly = '0 0 1 1 *'
}

export const enum MimeTypes {
	ApplicationJson = 'application/json',
	ApplicationFormUrlEncoded = 'application/x-www-form-urlencoded',
	TextPlain = 'text/plain'
}

export const enum Emojis {
	SettingsMenuBack = '◀',
	SettingsMenuStop = '⏹'
}
