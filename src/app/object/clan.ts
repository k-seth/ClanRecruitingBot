import { Player } from './player';

/**
 * A class representing a clan
 */
export class Clan {
    /**
     * @param id
     *      The clan's unique id
     * @param _tag
     *      The clan's tag
     * @param _roster
     *      The mapping of players in the clan
     */
    constructor(public readonly id: number,
                private _tag: string,
                private readonly _roster: Map<number, Player>
    ) {
    }

    /**
     * Gets the current clan tag
     *
     * @return
     *     The current clan tag
     */
    public getTag(): string {
        return this._tag;
    }

    /**
     * Sets the clan tag to the provided value
     *
     * @param tag
     *      The new clan tag to use
     */
    public setTag(tag: string): void {
        this._tag = tag;
    }

    /**
     * Gets the clan's player roster
     *
     * @returns
     *      A map containing the players in the clan
     */
    public getRoster(): Map<number, Player> {
        return new Map<number, Player>(this._roster);
    }

    /**
     * Updates the clan's roster based on the incoming deltas
     *
     * @param toAdd
     *      A map of the new players to add to the clan
     * @param toRemove
     *      A map of the players to remove from the clan
     */
    public updateRoster(toAdd: Map<number, Player>, toRemove: Map<number, Player>): void {
        for (const id of toRemove.keys()) {
            this._roster.delete(id);
        }

        for (const [id, player] of toAdd) {
            this._roster.set(id, player);
        }
    }

    /**
     * Provides the clan information in a user friendly format
     *
     * @return
     *      A string representation of the current clan
     */
    public getClanInfo(): string {
        // <tag>: <id>
        return `**${this._tag}**: ${this.id}`;
    }
}
