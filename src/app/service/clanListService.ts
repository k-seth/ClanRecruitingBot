import { createWriteStream, existsSync, readFileSync } from 'fs';
import { ApiService } from './apiService';
import { Clan } from '../object/clan';
import { ConfigService } from './configService';
import { Player } from '../object/player';
import { RosterUpdate } from "../util/interfaces";
import path from 'path';

/**
 * A service class responsible for providing the list of tracked clans, as well as all reading or writing operations
 */
export class ClanListService {
    private _clanList: Map<number, Clan>;
    private readonly _clanListPath: string = path.join(__dirname, '..', 'clan_list.json');

    /**
     * @param _apiService
     *      The service that handles api transactions
     * @param _configService
     *      The service that handles program configuration
     */
    constructor(private readonly _apiService: ApiService,
                private readonly _configService: ConfigService
    ) {
        void this.readClanList().then(list => this._clanList = list);
    }

    /**
     * Assigns the list of tracked clans from its file, creating it if it does not exist
     * Throws an error if an API failure occurs while creating the initial list
     *
     * @returns
     *      An empty promise
     * @private
     */
    private async readClanList(): Promise<Map<number, Clan>> {
        if (existsSync(this._clanListPath)) {
            // TODO: Determine if storing as a map is the best option
            // Also, with all the changes make sure this actually works now
            return JSON.parse(readFileSync(this._clanListPath, 'utf-8')) as Map<number, Clan>;
        }

        // Make sure the list is API safe
        const validClans: number[] = this._configService.configList().filter(clanId => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10));

        const clanData = await this._apiService.fetchClanData(validClans);

        // TODO: Verify a thrown error above will not cause file creation
        createWriteStream(this._clanListPath).write(JSON.stringify(clanData), 'utf-8');
        return clanData;
    }

    /**
     * Gets the tracked clans
     *
     * @returns
     *      The map of tracked clans
     */
    public getClanList(): Map<number, Clan> {
        return new Map<number, Clan>(this._clanList);
    }

    /**
     * Adds new clans to the list of tracked clans
     *
     * @param newClans
     *      The list of clans to add to the tracked clans
     * @returns
     *      A map of all the added clans
     */
    public addClans(newClans: Map<number, Clan>): Map<number, Clan> {
        const affectedClans: Map<number, Clan> = new Map<number, Clan>();
        for (const [id, clan] of newClans) {
            this._clanList.set(id, clan);
            // This may seem a bit redundant, and arguably yes it is. But, the function should
            // be the authority on what actions occurred. It should not rely on the input
            affectedClans.set(id, this._clanList.get(id));
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(this._clanList), 'utf-8');
        return affectedClans;
    }

    /**
     * Removes clans from the list of tracked clans
     *
     * @param idList
     *      The list of clans to remove from the tracked clans
     * @returns
     *      A map of all the removed clans
     */
    public removeClans(idList: number[]): Map<number, Clan> {
        const affectedClans: Map<number, Clan> = new Map<number, Clan>();
        for (const id of idList) {
            affectedClans.set(id, this._clanList.get(id));
            this._clanList.delete(id);
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(this._clanList), 'utf-8');
        return affectedClans;
    }

    /**
     * Updates each clan's roster with the new players and removes any that left
     *
     * @param rosterUpdate
     *      A map for each clan containing the players to add and remove
     * @return
     *      A map containing a map of players removed from each clan
     */
    public updateClanRoster(rosterUpdate: Map<number, RosterUpdate>): Map<number, Map<number, Player>> {
        const removedPlayers: Map<number, Map<number, Player>> = new Map<number, Map<number, Player>>();
        for (const [clanId, update] of rosterUpdate) {
            this._clanList.get(clanId).updateRoster(update.add, update.remove);
            removedPlayers.set(clanId, update.remove);
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(this._clanList), 'utf-8');

        return removedPlayers;
    }

    /**
     * Provides an API compatible list of the tracked clans
     *
     * @returns
     *      An array with the id of each tracked clan
     */
    public getApiList(): number[] {
        return Array.from(this._clanList.keys());
    }
}
