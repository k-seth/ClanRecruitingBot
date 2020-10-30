import { createWriteStream, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { Clan } from '../object/clan';
import { Api } from '../util/api';

/**
 * A service class responsible for providing the list of tracked clans, as well as all reading or writing operations
 */
export class ClanListService {
    public clanList: Clan[];
    private readonly _clanListPath: string = path.join(__dirname, '..', 'clan_list.json');

    /**
     * @param _clanList
     *      The list of clans in the config file
     * @param _api
     *      The api endpoint to use
     * @param _appId
     *      The application ID used with the Wargaming API
     */
    constructor(private readonly _clanList: string[],
                private readonly _api: string,
                private readonly _appId: string
    ) {
        this.loadClanList();
    }

    /**
     * Assigns the list of tracked clans from its file, creating it if it does not exist
     * Throws an error if an API failure occurs while creating the initial list
     *
     * @returns
     *      An empty promise
     * @private
     */
    private async loadClanList(): Promise<void> {
        if (!existsSync(this._clanListPath)) {
            const writeList: Clan[] = [];
            const clanData = await Api.chunkedApiCall(this._clanList, `${this._api}/wot/clans/info/`, 'clan_id',
                'tag', this._appId);
            if (clanData.result) {
                // This is a critical error, program functionality can not continue
                throw new Error('A critical error occurred loading the clan list');
            }

            for (const clanId in clanData) {
                const clanInfo = clanData[clanId];
                writeList.push(new Clan(parseInt(clanId, 10), clanInfo.tag));
            }

            // This write must be done synchronously, as we load it immediately after
            writeFileSync(this._clanListPath, JSON.stringify(writeList));
        }

        this.clanList = await import(this._clanListPath).then((list: Clan[]) => {
            return list;
        });
    }

    /**
     * Writes the list of tracked clans to file
     */
    public updateSavedList(): void {
        createWriteStream(this._clanListPath).write(JSON.stringify(this.clanList), 'utf-8');
    }

    /**
     * Provides an API compatible list of the tracked clans
     *
     * @returns
     *      An array with the id of each tracked clan
     */
    public getApiList(): number[] {
        const idList: number[] = [];

        for (const clan of this.clanList) {
            idList.push(clan.id);
        }

        return idList;
    }
}
