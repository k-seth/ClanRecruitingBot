/**
 * Error class for an invalid region
 */
export class RegionError extends Error {
    /**
     * @param _message
     *      The error message
     */
    constructor(private readonly _message: string) {
        super(_message);
    }
}
