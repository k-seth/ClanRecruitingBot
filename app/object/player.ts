import { Clan } from './clan';

/**
 * A class representing a player
 */
export class Player {
    private _status: string = null;
    // When assigning wn8, make sure it is wrapped in <>
    private _wn8: string = null;

    /**
     * @param _clan
     *      The clan the player is in
     * @param _name
     *      The name used by the player
     * @param id
     *      The player's unique account id
     */
    constructor(
        private _clan: Clan,
        private _name: string,
        public readonly id: number
    ) {
    }

    /**
     * Updates the player's info
     *
     * @param name
     *      The updated player name
     * @param clan
     *      The updated clan the player is in
     * @param status
     *      The updated status of the player
     * @param wn8
     *      The updated wn8 of the player
     */
    public updatePlayerInfo(name: string, clan: Clan, status: string, wn8: string): void {
        // TODO: Safely assign these - ignore null inputs
        this._name = name;
        this._clan = clan;
        this._status = status;
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
        // RWN8: <wn8> -> <status>
        return `${this._name} left ${this._clan.getTag()}\nRWN8: ${this._wn8} -> ${this._status}\n`;
    }
}
