/**
 * Error class for configuration errors
 */
export class ConfigError extends Error {
    /**
     * @param _message
     *      The error message
     */
    constructor(private readonly _message: string) {
        super(_message);
        this.name = 'ConfigError';
    }
}
