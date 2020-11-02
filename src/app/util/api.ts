// import fetch from 'node-fetch';
import axios from 'axios';

export class Api {
    /**
     * A simple API call using fetch. Uses POST to ensure data does not exceed URL length
     *
     * @param url
     *      The url to which to fetch the data from
     * @param body
     *      The body data to be sent. JSON encoded as URLSearchParams
     * @returns
     *      A JSON which is expected to be returned by the Wargaming API
     */
    public static async callApi(url: string, body: URLSearchParams): Promise<any|{result: string}> {
        const apiError = { result: 'An unexpected error occurred contacting the Wargaming API.' };
        const dataError = { result: 'An unexpected error occurred with the data returned by Wargaming.' };

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return await axios.post(url , body, { headers })
            .then(async res => {
                const response = await res.data;
                return response.status === 'error' ? dataError : response;
            })
            .catch(() => apiError);

        // return await fetch(url, {
        //     method: 'post',
        //     body,
        //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        // }).then(async res => {
        //     const response = await res.json();
        //     return response.status === 'error' ? dataError : response;
        // }).catch(() => apiError);
    }

    /**
     * Helper function to make chunked calls to the API to prevent making calls that are too large.
     *
     * @param data
     *      The array of data that needs to be chunked
     * @param url
     *      The URL for calling the API
     * @param requestId
     *      The name of the id associated with the API call. Used as the key name in the request parameters
     * @param fields
     *      The fields to include in the response from the API
     * @param appId
     *      The application id to enable access to the API
     * @returns
     *      An object containing all the data from the API calls
     */
    public static async chunkedApiCall(data: any[], url: string, requestId: string,
                                       fields: string, appId: string): Promise<{}|any|{result: string}> {
        const apiData = {};
        const maxSize = 100;

        for (let i = 0; i < data.length; i += maxSize) {
            const dataChunk = data.slice(i, i + maxSize).join();

            const bodyObj = { application_id: appId, [requestId]: dataChunk, fields };
            const json = await Api.callApi(url, new URLSearchParams(JSON.stringify(bodyObj)));
            if (json.result) {
                return json;
            }

            Object.assign(apiData, json.data);
        }
        return apiData;
    }
}
