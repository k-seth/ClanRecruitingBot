import { PersistenceEntity, RosterUpdate } from '../util/interfaces';
import { createWriteStream, existsSync, readFileSync } from 'fs';
import { ApiService } from './apiService';
import { Clan } from '../object/clan';
import { ConfigService } from './configService';
import { Player } from '../object/player';
import path from 'path';

/**
 * A service class responsible for providing the list of tracked clans, as well as all reading or writing operations
 */
export class ClanListService {
    private _clanList: Map<number, Clan>;
    private _lockout = false;
    private readonly _clanListPath: string = path.join(__dirname, '..', 'clan_list.json');

    /**
     * @param _apiService
     *      The service that handles api transactions
     * @param _configService
     *      The service that handles program configuration
     */
    constructor(private readonly _apiService: ApiService,
                private readonly _configService: ConfigService
    ) {
        this._lockout = true;
        void this.readClanList().then(list => {
            this._clanList = list;
            this._lockout = false;
        });
    }

    /**
     * Assigns the list of tracked clans from its file, creating it if it does not exist
     * Throws an error if an API failure occurs while creating the initial list
     *
     * @return
     *      An empty promise
     * @private
     */
    private async readClanList(): Promise<Map<number, Clan>> {
        if (existsSync(this._clanListPath)) {
            const data = JSON.parse(readFileSync(this._clanListPath, 'utf-8')) as PersistenceEntity;
            return ClanListService.unwrapPersistenceEntity(data);
        }

        // Make sure the list is API safe
        const validClans: number[] = this._configService.configList().filter(clanId => /^[0-9]*$/.test(clanId))
            .map(clanId => parseInt(clanId, 10));

        const clanData = await this._apiService.fetchClanData(validClans);

        createWriteStream(this._clanListPath).write(JSON.stringify(ClanListService.createPersistenceEntity(clanData)), 'utf-8');
        return clanData;
    }

    /**
     * Gets the tracked clans
     *
     * @return
     *      The map of tracked clans
     */
    public getClanList(): Map<number, Clan> {
        return new Map<number, Clan>(this._clanList);
    }

    /**
     *
     * @return
     */
    public getLockout(): boolean {
        return this._lockout;
    }

    /**
     * Adds new clans to the list of tracked clans
     *
     * @param newClans
     *      The list of clans to add to the tracked clans
     * @returns
     *      A map of all the added clans
     */
    public addClans(newClans: Map<number, Clan>): Map<number, Clan> {
        const affectedClans: Map<number, Clan> = new Map<number, Clan>();
        for (const [id, clan] of newClans) {
            this._clanList.set(id, clan);
            // This may seem a bit redundant, and arguably yes it is. But, the function should
            // be the authority on what actions occurred. It should not rely on the input
            affectedClans.set(id, this._clanList.get(id));
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(ClanListService.createPersistenceEntity(this._clanList)), 'utf-8');
        return affectedClans;
    }

    /**
     * Removes clans from the list of tracked clans
     *
     * @param idList
     *      The list of clans to remove from the tracked clans
     * @return
     *      A map of all the removed clans
     */
    public removeClans(idList: number[]): Map<number, Clan> {
        const affectedClans: Map<number, Clan> = new Map<number, Clan>();
        for (const id of idList) {
            affectedClans.set(id, this._clanList.get(id));
            this._clanList.delete(id);
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(ClanListService.createPersistenceEntity(this._clanList)), 'utf-8');
        return affectedClans;
    }

    /**
     * Updates each clan's roster with the new players and removes any that left
     *
     * @param rosterUpdate
     *      A map for each clan containing the players to add and remove
     * @return
     *      A map containing a map of players removed from each clan
     */
    public updateClanRoster(rosterUpdate: Map<number, RosterUpdate>): Map<number, Map<number, Player>> {
        const removedPlayers: Map<number, Map<number, Player>> = new Map<number, Map<number, Player>>();
        for (const [clanId, update] of rosterUpdate) {
            this._clanList.get(clanId).updateRoster(update.add, update.remove);
            if (update.remove.size) {
                removedPlayers.set(clanId, update.remove);
            }
        }

        createWriteStream(this._clanListPath).write(JSON.stringify(ClanListService.createPersistenceEntity(this._clanList)), 'utf-8');

        return removedPlayers;
    }

    /**
     * Provides an API compatible list of the tracked clans
     *
     * @return
     *      An array with the id of each tracked clan
     */
    public getApiList(): number[] {
        return Array.from(this._clanList.keys());
    }

    /**
     * Helper function for converting the map object used by the program into a JSON friendly format for file IO
     *
     * @param data
     *      The Map of clan and player data to convert
     * @return
     *      A persistence entity capable of being properly written to file
     * @private
     */
    private static createPersistenceEntity(data: Map<number, Clan>): PersistenceEntity {
        const entity: PersistenceEntity = {};

        for (const [clanId, clan] of data.entries()) {
            const simplifiedRoster = {};
            for (const [playerId, player] of clan.getRoster()) {
                simplifiedRoster[playerId] = {
                    id: playerId,
                    _name: player.getName(),
                    _status: player.getStatus(),
                    _server: player.getServer(),
                    _wn8: player.getWotLabs()
                };
            }

            entity[clanId] = {
                id: clanId,
                _tag: clan.getTag(),
                _roster: simplifiedRoster
            };
        }

        return entity;
    }

    /**
     * Helper function for converting a file IO friendly object into the map object used by the program
     *
     * @param data
     *      The persistence entity read from a file
     * @return
     *      A map of the clans and players
     * @private
     */
    private static unwrapPersistenceEntity(data: PersistenceEntity): Map<number, Clan> {
        const clans: Map<number, Clan> = new Map<number, Clan>();
        Object.keys(data).forEach(clanId => {
            const clan = data[clanId];
            const roster = clan._roster;

            const clanRoster: Map<number, Player> = new Map<number, Player>();
            Object.keys(roster).forEach(playerId => {
                const player = roster[playerId];
                clanRoster.set(player.id, new Player(player._name, player._status, player._server, player.id));
            });

            clans.set(clan.id, new Clan(clan.id, clan._tag, clanRoster));
        });

        return clans;
    }
}
