/**
 * Interface defining the configuration format of the application
 */
export interface Config {
    app: {
        readonly application_id: string,
        inactive_weeks: number,
        readonly server: string,
        recruitment: {
            desired_rwn8: number,
            min_rwn8: number,
            links_below_min: boolean
        }
    };
    bot: {
        readonly token: string,
        prefix: string,
        commands: {
            seed: string,
            check: string,
            list: string,
            add: string,
            remove: string,
            help: string
        },
        limit_to: string[]
    };
    readonly clanList: string[];
}
