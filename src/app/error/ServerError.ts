/**
 * Error class for an invalid server
 */
export class ServerError extends Error {
    /**
     * @param _message
     *      The error message
     */
    constructor(private readonly _message: string) {
        super(_message);
        this.name = 'ServerError';
    }
}
