import { createWriteStream, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { ApiError } from '../error/ApiError';
import { Clan } from '../object/clan';
import { Api } from '../util/api';

/**
 * A service class responsible for providing the list of tracked clans, as well as all reading or writing operations
 */
export class ClanListService {
    private clanList: Clan[];
    private readonly _clanListPath: string = path.join(__dirname, '..', 'clan_list.json');

    /**
     * @param _configList
     *      The list of clans in the config file
     * @param _api
     *      The api endpoint to use
     * @param _appId
     *      The application ID used with the Wargaming API
     */
    constructor(private readonly _configList: string[],
                private readonly _api: string,
                private readonly _appId: string
    ) {
        this.readClanList();
    }

    /**
     * Assigns the list of tracked clans from its file, creating it if it does not exist
     * Throws an error if an API failure occurs while creating the initial list
     *
     * @returns
     *      An empty promise
     * @private
     */
    private async readClanList(): Promise<void> {
        if (!existsSync(this._clanListPath)) {
            let writeList: Clan[] = [];
            // Make sure the list is API safe
            const sanitizedConfigList: number[] = this._configList.filter(clanId => /^[0-9]*$/.test(clanId))
                .map(clanId => parseInt(clanId, 10));

            if (!!sanitizedConfigList.length) {
                const clanData = await Api.chunkedApiCall(sanitizedConfigList, `${this._api}/wot/clans/info/`, 'clan_id',
                    'tag', this._appId);
                if (clanData.result) {
                    // This is a critical error, program functionality can not continue
                    throw new ApiError('A critical error occurred loading the clan list');
                }

                // Filter out any invalid clans, and create the new clan list
                writeList = Object.keys(clanData).filter(clanId => clanData[clanId] !== null)
                    .map(clanId => parseInt(clanId, 10))
                    .map(clanId => new Clan(clanId, clanData[clanId].tag));
            }

            // This write must be done synchronously, as we load it immediately after
            writeFileSync(this._clanListPath, JSON.stringify(writeList));
        }

        this.clanList = await import(this._clanListPath).then((list: Clan[]) => {
            return list;
        });
    }

    /**
     * Gets the list of tracked clans
     *
     * @returns
     *      The list of tracked clans
     */
    public getClanList(): Clan[] {
        return this.clanList;
    }

    /**
     * Adds clans to the list of tracked clans based on the clans in the delta
     *
     * @param delta
     *      The list of clans ids to add to the tracked clans list
     * @returns
     *      An array with all the affected clans
     */
    public addTrackedClans(delta: Clan[]): string[] {
        for (const clan of delta) {
            this.clanList.push(clan);
        }
        this.updateSavedList();
        return delta.map(clan => clan.id.toString());
    }

    /**
     * Removes clans from the list of tracked clans based on the clans in the delta
     *
     * @param delta
     *      The clans to remove from the tracked clans list
     * @returns
     *      An array with all the affected clans
     */
    public removeTrackedClans(delta: number[]): string[] {
        for (const clanId of delta) {
            const index = this.clanList.findIndex(clan => clan.id === clanId);
            this.clanList.splice(index, 1);
        }
        this.updateSavedList();
        return delta.map(clanId => clanId.toString());
    }

    /**
     * Writes the list of tracked clans to file
     * @private
     */
    private updateSavedList(): void {
        createWriteStream(this._clanListPath).write(JSON.stringify(this.clanList), 'utf-8');
    }

    /**
     * Provides an API compatible list of the tracked clans
     *
     * @returns
     *      An array with the id of each tracked clan
     */
    public getApiList(): number[] {
        return this.clanList.map(clan => clan.id);
    }
}
