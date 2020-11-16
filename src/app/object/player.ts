import { PlayerStatus } from '../util/util';

/**
 * A class representing a player
 */
export class Player {
    private _lastBattle: number = null;
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
     * @param lastBattle
     *      The epoch time time of the player's last battle
     */
    public setLastBattle(lastBattle: number): void {
        this._lastBattle = lastBattle;
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
        if (status === PlayerStatus.Active) {
            return `${ this._name } (WN8: ${ this._wn8 }\n<${ this.getWotLabs() }>`;
        }

        return `${ this._name } (WN8: ${ this._wn8 }\n${ status }`;
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
