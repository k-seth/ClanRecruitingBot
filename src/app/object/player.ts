import { PlayerStatus } from '../util/util';
import { Clan } from './clan';

/**
 * A class representing a player
 */
export class Player {
    private _status: PlayerStatus = PlayerStatus.Active;
    private _wn8: string = null;
    private _wotLabs: string = null;

    /**
     * @param _clan
     *      The clan the player is in
     * @param _name
     *      The name used by the player
     * @param _region
     *      The server region the player is in
     * @param id
     *      The player's unique account id
     */
    constructor(
        private _clan: Clan,
        private _name: string,
        private readonly _region: string,
        public readonly id: number
    ) {
    }

    /**
     * Updates the basic player info that can be retrieved from the Wargaming API
     *
     * @param name
     *      The player name
     * @param clan
     *      The clan the player is currently in
     */
    public updateBasicInfo(name: string, clan: Clan): void {
        this._name = name;
        this._clan = clan;
        // If assigning wotlabs, it will need to be wrapped in <>
        this._wotLabs = `https://wotlabs.net/${this._region}/player/${this._name}`;
    }

    /**
     *
     *
     * @param status
     *      The status of the player. Either 'Inactive', 'Below requirements' or `Active`
     */
    public setStatus(status: PlayerStatus): void {
        this._status = status;
    }

    /**
     *
     * @param wn8
     *      The updated wn8 of the player
     */
    public setWn8(wn8: string): void {
        this._wn8 = wn8;
    }

    /**
     * Provides the player information in a user friendly format
     *
     * @return
     *      A string containing the player's info
     */
    public getPlayerInfo(): string {
        // <player> left <clan>
        // RWN8: <wn8> -> <status/WotLabs>
        return `${this._name} left ${this._clan.getTag()}\nRWN8: ${this._wn8} -> ${this._status === PlayerStatus.Active ? this._wotLabs : this._status}\n`;
    }

    /**
     * Gets the clan id of the clan the player is in
     *
     * @returns
     *      The players clan id
     */
    public getClanId(): number {
        return this._clan.id;
    }
}
