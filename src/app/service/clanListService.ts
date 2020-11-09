import { createWriteStream, existsSync, readFileSync } from 'fs';
import path from 'path';
import { ApiError } from '../error/ApiError';
import { Clan } from '../object/clan';
import { Api } from '../util/api';
import { ConfigService } from './configService';
import {Player} from "../object/player";

/**
 * A service class responsible for providing the list of tracked clans, as well as all reading or writing operations
 */
export class ClanListService {
    private _clanList: Map<number, Clan>;
    private readonly _clanListPath: string = path.join(__dirname, '..', 'clan_list.json');

    /**
     * @param _configService
     *      The service that handles program configuration
     */
    constructor(private _configService: ConfigService
    ) {
        this.readClanList().then(list => this._clanList = list);
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
            return JSON.parse(readFileSync(this._clanListPath, 'utf-8'));
        }

        // Make sure the list is API safe
        const validClans: number[] = this._configService.configList().filter(clanId => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10));

        const clanData = await this.fetchClanData(validClans);

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
     * Adds clans to the list of tracked clans based on the clans in the delta
     *
     * @param idList
     *      The list of clans to add to the tracked clans
     * @returns
     *      An array with all the affected clans
     */
    public async addClans(idList: number[]): Promise<string[]> {
        let clanData: Map<number, Clan>;
        try {
            clanData = await this.fetchClanData(idList);
        } catch (error) {
            return [error.message];
        }

        if (!clanData.size) {
            return ['No clans supplied.'];
        }

        for (const [id, clan] of clanData) {
            this._clanList.set(id, clan);
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(this._clanList), 'utf-8');
        return Array.from(clanData.keys()).map(id => id.toString());
    }

    /**
     * Removes clans from the list of tracked clans based on the clans in the delta
     *
     * @param idList
     *      The list of clans to remove from the tracked clans
     * @returns
     *      An array with all the affected clans
     */
    public removeClans(idList: number[]): string[] {
        for (const id of idList) {
            this._clanList.delete(id);
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(this._clanList), 'utf-8');
        return idList.map(clanId => clanId.toString());
    }

    /**
     * Constructs a map of the requests clans
     *
     * @param idList
     *      The list of clan ids to get data for
     * @returns
     *      A map of the requested clans
     * @private
     */
    private async fetchClanData(idList: number[]): Promise<Map<number, Clan>> {
        const apiResult = await Api.chunkedApiCall(idList, `${this._configService.apiEndpoint()}/wot/clans/info/`,
            'clan_id', 'members.account_id,members.account_name,tag', this._configService.appId());

        if (apiResult.result) {
            throw ApiError(apiResult.result);
        }

        const clanData: Map<number, Clan> = new Map<number, Clan>();

        for (const id of Object.keys(apiResult)) {
            const clanId: number = parseInt(id, 10);
            if (apiResult[clanId] === null) {
                continue;
            }

            const data: { tag: string, members: any[] } = clanData[clanId];
            const roster: Map<number, Player> = new Map<number, Player>();

            for (const player of data.members) {
                roster.set(player.account_id, new Player(player.account_name, this._configService.server(), player.account_id));
            }

            const clan = new Clan(clanId, data.tag, roster);
            clanData.set(clanId, clan);
        }

        return clanData;
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
