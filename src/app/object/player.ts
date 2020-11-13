import { PlayerStatus } from '../util/util';

/**
 * A class representing a player
 */
export class Player {
    private _status: PlayerStatus = PlayerStatus.Active;
    private _wn8: number = null;

    /**
     * @param _name
     *      The name used by the player
     * @param _server
     *      The game server of the player
     * @param id
     *      The player's unique account id
     */
    constructor(
        private _name: string,
        private readonly _server: string,
        public readonly id: number
    ) {
    }

    /**
     * Updates the basic player info that can be retrieved from the Wargaming API
     *
     * @param name
     *      The player name
     */
    public updateBasicInfo(name: string): void {
        this._name = name;
    }

    /**
     *
     *
     * @param status
     *      The status of the player
     */
    public setStatus(status: PlayerStatus): void {
        this._status = status;
    }

    /**
     *
     * @param wn8
     *      The updated wn8 of the player
     */
    public setWn8(wn8: number): void {
        this._wn8 = wn8;
    }

    /**
     * Provides the player information in a user friendly format
     *
     * @return
     *      A string containing the player's info
     */
    public getPlayerInfo(): string {
        // <player> (WN8: <wn8>)
        // <status/WotLabs>
        if (this._status === PlayerStatus.Active) {
            return `${ this._name } (WN8: ${ this._wn8 }\n<${ this.getWotLabs() }>`;
        }

        return `${ this._name } (WN8: ${ this._wn8 }\n${ this._status }`;
    }

    /**
     * Provides the player's WotLabs link
     *
     * @return
     *      A string containing the player's link
     */
    public getWotLabs(): string {
        return `https://wotlabs.net/${ this._server }/player/${ this._name }`;
    }
}
