import { Player } from '../object/player';
import { PlayerStatus } from './util';

/**
 * Interface defining the expected format for clan data from the Wargaming API
 */
export interface ClanDetails {
    [id: string]: {
        tag: string;
        members: ClanMemberDetails[];
        is_clan_disbanded: boolean;
    };
}

/**
 * Interface defining the expected format for clan member data from the Wargaming API
 */
export interface ClanMemberDetails {
    account_id: number;
}

/**
 * Interface defining the expected format for player data from the Wargaming API
 */
export interface PlayerDetails {
    [id: string]: {
        nickname: string;
        last_battle_time: number;
    };
}

/**
 * Interface for defining the delta format for updating a clan roster
 */
export interface RosterUpdate {
    remove: Map<number, Player>;
    add: Map<number, Player>;
}

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

/**
 * Interface defining the JSON object for file IO
 */
export interface PersistenceEntity {
    [clanId: string]: {
        id: number,
        _tag: string,
        _roster: {
            [playerId: string]: {
                id: number,
                _name: string,
                _status: PlayerStatus,
                _server: string,
                _wn8: number
            }
        }
    }
}