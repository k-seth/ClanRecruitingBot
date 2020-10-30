/**
 * A class representing a clan
 */
export class Clan {
    /**
     * @param id
     *      The clan's unique id
     * @param _tag
     *      The clan's tag
     */
    constructor(public readonly id: number,
                private _tag: string
    ) {
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
     * Gets the current clan tag
     *
     * @return
     *     The current clan tag
     */
    public getTag(): string {
        return this._tag;
    }

    /**
     * Provides the clan information in a user friendly format
     *
     * @return
     *      A string representation of the current clan
     */
    public getClanInfo(): string {
        // <id> - <tag>
        return `${this.id} - ${this._tag.replace(/_/g, '\\\_')}`;
    }
}
