import { createWriteStream, readFileSync } from 'fs';
import { Player } from '../object/player';

/**
 * A service class responsible for providing the player rosters, as well as all reading or writing operations
 */
export class PlayerListService {
    private readonly _rosterPath = './data/oldRosters';

    constructor() {
    }


    public retrieveRoster(): Player[] {
        return JSON.parse(readFileSync(this._rosterPath, 'utf-8'));
    }

    /**
     * Saves the provided roster to file
     */
    public saveRoster(roster: Player[]): void {
        createWriteStream(this._rosterPath).write(JSON.stringify(roster), 'utf-8');
    }
}
