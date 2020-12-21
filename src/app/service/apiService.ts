import axios from 'axios';
import { ApiError } from '../error/ApiError';
import { Clan } from '../object/clan';
import { Player } from '../object/player';
import { ClanDetails, PlayerDetails } from '../util/interfaces';
import { PlayerStatus } from '../util/util';
import { ConfigService } from './configService';

/**
 * A service class responsible for providing the making API requests
 */
export class ApiService {
    /**
     * @param _configService
     *      The service that handles program configuration
     */
    constructor(private readonly _configService: ConfigService) {
    }

    /**
     * A simple API call using fetch. Uses POST to ensure data does not exceed URL length.
     * Throws an error in the event of failure in the API call.
     *
     * @param url
     *      The url to which to fetch the data from
     * @param body
     *      The body data to be sent. JSON encoded as URLSearchParams
     * @return
     *      The raw data from the Wargaming API
     * @private
     */
    private static async callApi(url: string, body: URLSearchParams): Promise<{ status: string, meta, data }> {
        const apiError = 'An unexpected error occurred contacting the Wargaming API.';
        const dataError = 'An unexpected error occurred with the data returned by Wargaming.';

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        // TODO: There seems to be an issue with this that results in the application_id not being recognized
        return await axios.post(url , body, { headers })
            .then(async res => {
                const response: { status: string, meta, data } = await res.data;
                if (response.status === 'error') {
                    throw new ApiError(dataError);
                }
                return response;
            })
            .catch(() => { throw new ApiError(apiError); });
    }

    /**
     * TODO: Not yet implemented.
     * A simple API call using fetch. Uses GET to retrieve the WoTLabs page for the player
     *
     * @param url
     *      The url to fetch the data from
     * @return
     *      A string which is a raw version of the player's WoTLab page
     * @private
     */
    private static async callWotlabs(url): Promise<string> {
        const apiError = 'An unexpected error occurred contacting WoTLabs';

        const headers = { "Content-Type": "text/html" };
        return await axios.get(url, { headers })
            .then(async res => await res.data() as string)
            .catch(() => { throw new ApiError(apiError); });
    }

    /**
     * Helper function to make chunked calls to the API to prevent making calls that are too large.
     * To ensure limit safety, all Wargaming API calls should go though this function.
     *
     * @param data
     *      The array of data that needs to be chunked
     * @param url
     *      The URL for calling the API
     * @param requestId
     *      The name of the id associated with the API call. Used as the key name in the request parameters
     * @param fields
     *      The fields to include in the response from the API
     * @return
     *      The collected raw results from the Wargaming API
     * @private
     */
    private async chunkedApiCall(
        data: string[] | number[],
        url: string,
        requestId: string,
        fields: string,
    ): Promise<any> {
        const apiData: { [id: string]: ClanDetails|PlayerDetails } = {};
        const maxSize = 100;

        for (let i = 0; i < data.length; i += maxSize) {
            const dataChunk = data.slice(i, i + maxSize).join();

            const bodyObj = { application_id: this._configService.appId(), [requestId]: dataChunk, fields };
            const json: { status: string, meta, data } = await ApiService.callApi(url, new URLSearchParams(bodyObj));

            Object.assign(apiData, json.data);
        }
        return apiData;
    }

    /**
     * Constructs a map of the requested clans
     *
     * @param idList
     *      The list of clan ids to get data for
     * @return
     *      A map of the requested clans
     */
    public async fetchClanData(idList: number[]): Promise<Map<number, Clan>> {
        const clanResult: ClanDetails = await this.chunkedApiCall(idList,
            `${ this._configService.apiEndpoint() }/wot/clans/info/`, 'clan_id',
            'members.account_id,tag,is_clan_disbanded');

        const clanData: Map<number, Clan> = new Map<number, Clan>();

        for (const clanId of idList) {
            const data = clanResult[clanId];

            // Drop clans that do not exist or that have been disbanded
            if (data === null || data.is_clan_disbanded) {
                continue;
            }

            const memberIds: number[] = data.members.map(object => object.account_id);
            const roster: Map<number, Player> = await this.fetchPlayerData(memberIds);

            const clan = new Clan(clanId, data.tag, roster);
            clanData.set(clanId, clan);
        }

        return clanData;
    }

    /**
     * Constructs a map of the requested players
     *
     * @param idList
     *      The list of clan ids to get data for
     * @return
     *      A map of the requested players
     */
    public async fetchPlayerData(idList: number[]): Promise<Map<number, Player>> {
        // This is a huge waste of an API call, but Wargaming does not provide last battle time via clan member data
        const playerResult: PlayerDetails = await this.chunkedApiCall(idList,
            `${ this._configService.apiEndpoint() }/wot/account/info/`, 'account_id', 'nickname,last_battle_time');

        const playerData: Map<number, Player> = new Map<number, Player>();

        for (const id of idList) {
            const details = playerResult[id];
            const playerStatus: PlayerStatus = this.determineStatus(details.last_battle_time);
            playerData.set(id, new Player(details.nickname, playerStatus, this._configService.server(), id));
        }

        return playerData;
    }

    /**
     * Helper function for determining the player's status
     *
     * @param lastBattle
     *      Epoch time of the player's last battle
     * @return
     *      The player's status
     * @private
     */
    private determineStatus(lastBattle: number): PlayerStatus {
        const epochWeek = 604800;
        const inactivePeriod = this._configService.getInactivePeriod();

        // TODO: This will eventually need to determine if below requirements as well
        if (inactivePeriod < 1 || (new Date).getTime()/1000 - lastBattle < epochWeek * inactivePeriod) {
            return PlayerStatus.Active;
        }

        return PlayerStatus.Inactive;
    }
}
