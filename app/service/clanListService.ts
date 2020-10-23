import { createWriteStream, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { Clan } from '../object/clan';

/**
 * A service class responsible for providing the list of tracked clans, as well as all reading or writing operations
 */
export class ClanListService {
    public clanList: Clan[];
    public readonly _trackedClansPath: string = path.join(__dirname, '..', 'clan_list.json');

    constructor(private readonly configClanList: Clan[]) {
        this.loadClanList(configClanList);
    }

    /**
     * Assigns the list of tracked clans from its file, creating it if it does not exist
     *
     * @private
     */
    private async loadClanList(clanList: Clan[]): Promise<void> {
        // TODO: Change this to read the clan list only if not existing, create it, then open it
        if (!existsSync(this._trackedClansPath)) {
            writeFileSync(this._trackedClansPath, JSON.stringify({ clanList }));
        }

        this.clanList = await import(this._trackedClansPath).then((list: {clanList: Clan[]}) => {
            return list.clanList;
        });
    }

    /**
     * Writes the list of tracked clans to file
     */
    public updateSavedList(): void {
        createWriteStream(this._trackedClansPath).write(JSON.stringify({ clanList: this.clanList }), 'utf-8');
    }
}
