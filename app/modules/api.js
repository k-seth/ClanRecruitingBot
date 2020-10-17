import fetch from "node-fetch";

export class Api {
    /**
     * A simple API call using fetch. Uses POST to ensure data does not exceed URL length
     *
     * @param url
     *      The url to fetch the data from
     * @param body
     *      The body data to be sent. JSON encoded as URLSearchParams
     * @returns {Promise<T|{result: string}>}
     *      A JSON which is expected to be returned by the Wargaming API
     */
    static async callApi(url, body) {
        const ERR_API = { result: "An unexpected error occurred contacting the Wargaming API" };
        const ERR_RTN = { result: "An unexpected error occurred with the data returned by Wargaming" };

        return await fetch(url, {
            method: "post",
            body: body,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }).then(async res => {
            const response = await res.json();
            return response.status === "error" ? ERR_RTN : response;
        }).catch(() => ERR_API);
    }

    /**
     * A simple API call using fetch. Uses GET to retrieve the Wotlabs page for the player
     *
     * @param url
     *      The url to fetch the data from
     * @returns {Promise<*|{result: string}>}
     *      A string which is a raw version of the player's Wotlab page
     */
    static async callWotlabs(url) {
        const ERR_API = { result: "An unexpected error occurred contacting Wotlabs" };

        return await fetch(url, {
            method: "get",
            body: null,
            headers: { "Content-Type": "text/html" }
        }).then(async res => await res.text()
        ).catch(() => ERR_API);
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
     * @returns {Promise<{}|T|{result: string}>}
     *      An object containing all the data from the API calls
     */
    static async chunkedApiCall(data, url, requestId, fields, appId) {
        const apiData = {};
        const MAX_API_SIZE = 100;

        for (let i = 0; i < data.length; i += MAX_API_SIZE) {
            const dataChunk = data.slice(i, i + MAX_API_SIZE).join();

            const bodyObj = { application_id: appId, [requestId]: dataChunk, fields: fields };
            const json = await Api.callApi(url, new URLSearchParams(bodyObj));
            if (json.result) {
                return json;
            }

            Object.assign(apiData, json.data);
        }
        return apiData;
    }
}
