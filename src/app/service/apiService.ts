import { ClanDetails, PlayerDetails } from '../util/interfaces';
import { ApiError } from '../error/ApiError';
import { Clan } from '../object/clan';
import { ConfigService } from './configService';
import { Player } from '../object/player';
import axios from 'axios';

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
     * @returns
     *      The raw data from the Wargaming API
     */
    private static async callApi(url: string, body: URLSearchParams): Promise<{ status: string, meta, data }> {
        const apiError = 'An unexpected error occurred contacting the Wargaming API.';
        const dataError = 'An unexpected error occurred with the data returned by Wargaming.';

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
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
     * @returns
     *      A string which is a raw version of the player's WoTLab page
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
     * @returns
     *      The collected raw results from the Wargaming API
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
            const json: { status: string, meta, data } = await ApiService.callApi(url, new URLSearchParams(JSON.stringify(bodyObj)));

            Object.assign(apiData, json.data);
        }
        return apiData;
    }

    /**
     * Constructs a map of the requested clans
     *
     * @param idList
     *      The list of clan ids to get data for
     * @returns
     *      A map of the requested clans
     */
    public async fetchClanData(idList: number[]): Promise<Map<number, Clan>> {
        const clanResult: ClanDetails = await this.chunkedApiCall(idList,
            `${ this._configService.apiEndpoint() }/wot/clans/info/`, 'clan_id',
            'members.account_id,members.account_name,tag,is_clan_disbanded');

        const clanData: Map<number, Clan> = new Map<number, Clan>();

        for (const clanId of idList) {
            const data = clanResult[clanId];

            // Drop clans that do not exist or that have been disbanded
            if (data === null || data.is_clan_disbanded) {
                continue;
            }

            const roster: Map<number, Player> = new Map<number, Player>();

            for (const player of data.members) {
                const id: number = player.account_id;
                roster.set(id, new Player(player.account_name, this._configService.server(), id));
            }

            const clan = new Clan(clanId, data.tag, roster);
            clanData.set(clanId, clan);
        }

        return clanData;
    }


    public async fetchPlayerData(idList): Promise<> {
        // This is a huge waster of an API call, but Wargaming does not provide last battle time via clan member data
        const playerResult: PlayerDetails = await this.chunkedApiCall(idList,
            `${ this._configService.apiEndpoint() }/wot/account/info/`, 'account_id', 'last_battle_time');

    }
}
