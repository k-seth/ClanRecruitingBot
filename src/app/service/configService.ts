import { existsSync, readFileSync } from 'fs';
import { Config } from '../util/interfaces';
import { ConfigError } from '../error/ConfigError';
import { Util } from '../util/util';
import path from 'path';

/**
 * A service class responsible for providing and updating the bot configuration
 */
export class ConfigService {
    private readonly _configPath = path.join(__dirname, '..', 'config.json');

    private readonly _config: Config;
    private readonly _api: string;

    private readonly _restrictedChannels: Set<string>;
    private readonly _commands: Map<string, string>;

    constructor() {
        // This may seem like a lot of extra work now, but there is a future plan for this
        // Eventually (and completely unnecessarily) I'd like to add runtime configuration changes
        if (!existsSync(this._configPath)) {
            throw new ConfigError('Configuration file does not exist');
        }
        this._config = JSON.parse(readFileSync(this._configPath, 'utf-8')) as Config;

        // TODO: Create and run a validator class that ensures the config file is well formed

        this._api = `https://api.worldoftanks${ Util.determineApiDomain(this._config.app.server) }`;
        this._restrictedChannels = new Set<string>(this._config.bot.limit_to);
        this._commands = new Map<string, string>(Object.entries(this._config.bot.commands));
    }

    // Readonly configs. These use more unique names

    /**
     * Gets the base api endpoint to use when calling the Wargaming API
     *
     * @return
     *      The Wargaming API endpoint to call
     */
    public apiEndpoint(): string {
        return this._api;
    }

    /**
     * Gets the application id used for api calls
     *
     * @return
     *      The application id to use during API calls
     */
    public appId(): string {
        return this._config.app.application_id;
    }

    /**
     * Gets the clan list in the config file to use as the base list
     *
     * @return
     *      The default list of clans in the config file
     */
    public configList(): string[] {
        return Array.from(this._config.clanList);
    }

    /**
     * Gets the Wargaming server being used
     *
     * @return
     *      The Wargaming server
     */
    public server(): string {
        return this._config.app.server;
    }

    /**
     * Gets the Discord bot token
     *
     * @return
     *      The token required to connect to Discord
     */
    public token(): string {
        return this._config.bot.token;
    }

    // Editable configs. These will use a more boilerplate naming scheme

    /**
     * Gets the bot commands
     *
     * @return
     *      A map of the commands usable by the bot
     */
    public getCommands(): Map<string, string> {
        return new Map<string, string>(this._commands);
    }

    /**
     * Gets the command prefix
     *
     * @return
     *      The prefix used by the bot
     */
    public getPrefix(): string {
        return this._config.bot.prefix;
    }

    /**
     * Gets the set of channels the bot is restricted to reading messages in.
     * This is intended to supplement Discord permissions.
     *
     * @return
     *      The set of channels the bot is restricted to reading
     */
    public getRestrictedChannels(): Set<string> {
        return new Set<string>(this._restrictedChannels);
    }

    /**
     * Gets the number of weeks before a player is considered inactive
     *
     * @return
     *      The number of weeks before a player is labelled inactive
     */
    public getInactivePeriod(): number {
        return this._config.app.inactive_weeks;
    }
}
