/**
 * Error class for critical api issues
 */
export class ApiError extends Error {
    /**
     * @param _message
     *      The error message
     */
    constructor(private readonly _message: string) {
        super(_message);
        this.name = 'ApiError';
    }
}
