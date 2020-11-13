// I don't like the name of these interfaces, but this will do for now

/**
 * Interface defining the expected format for clan data from the Wargaming API
 */
export interface ClanApi {
    tag: string;
    members: MemberApi[];
}

/**
 * Interface defining the expected format for clan member data from the Wargaming API
 */
export interface MemberApi {
    account_name: string;
    account_id: number;
}

/**
 * Interface defining the expected format for player data from the Wargaming API
 */
export interface PlayerApi {
    last_battle_time: number;
    nickname: string;
}
