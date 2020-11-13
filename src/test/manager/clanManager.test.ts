import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import test, { ExecutionContext } from 'ava';
import { ApiError } from '../../app/error/ApiError';
import { Clan } from '../../app/object/clan';
import { ApiService } from '../../app/service/apiService';
import { ClanListService } from '../../app/service/clanListService';
import { ClanManager } from '../../app/manager/clanManager';

let sandbox: SinonSandbox;
let clanListService: SinonStubbedInstance<ClanListService>;
let apiService: SinonStubbedInstance<ApiService>;
let clanManager: ClanManager;

let testClanList: Map<number, Clan>;

let addTrackedClansResponse: string[];
let removeTrackedClansResponse: string[];

const addedMessage = ['Successfully added:\n1234\n5678\n'];
const removedMessage = ['Successfully removed:\n123\n456\n'];

test.beforeEach(() => {
    sandbox = sinon.createSandbox();
    apiService = sandbox.createStubInstance(ApiService);
    clanListService = sandbox.createStubInstance(ClanListService);
    clanManager = new ClanManager(apiService as unknown as ApiService, null, clanListService as unknown as ClanListService);

    testClanList = new Map<number, Clan>();
    testClanList.set(123, new Clan(123, 'TesT', null));
    testClanList.set(456, new Clan(456, '_TAG_', null));
    testClanList.set(789, new Clan(789, '_clan', null));

    addTrackedClansResponse = ['1234', '5678'];
    removeTrackedClansResponse = ['123', '456'];
});

test.afterEach(() => {
    sandbox.restore();
});

const addClans = async (t: ExecutionContext, clansToAdd: string[], expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    clanListService.addClans.returns(addTrackedClansResponse);
    apiService.fetchClanData.returns(testClanList);
    const actual = await clanManager.addClans(clansToAdd);

    t.deepEqual(actual, expected);
};

test('addClans empty input', addClans, [], ['No clans supplied.\n']);
test('addClans invalid format input', addClans, ['testClan', '12345t'], ['None of the requested clans are valid.\n']);
test('addClans existing clans in input', addClans, ['123', '456'], ['None of the requested clans are valid.\n']);

// These all need to be serial due to the extra stubbing of the API call
test.serial('addClans valid input list', addClans, ['1234', '5678'], addedMessage);
test.serial('addClans mixed validity input list', addClans, ['1234', '5678', '1111'], addedMessage);

test.serial('addClans api error', async t => {
    const expected = ['Error\n'];

    clanListService.getClanList.returns(testClanList);
    apiService.fetchClanData.throws(new ApiError('Error'));
    const actual = await clanManager.addClans(['1234', '5678']);

    t.deepEqual(actual, expected);
});

const removeClans = (t: ExecutionContext, clansToRemove: string[], expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    clanListService.removeClans.returns(removeTrackedClansResponse);
    const actual = clanManager.removeClans(clansToRemove);

    t.deepEqual(actual, expected);
};

test('removeClans empty input', removeClans, [], ['No clans supplied.\n']);
test('removeClans invalid format input', removeClans,
    ['testClan', '12345t'], ['None of the requested clans are valid.\n']);
test('removeClans nonexistent clans in input', removeClans,
    ['1234', '5690'], ['None of the requested clans are valid.\n']);

// The following two need to be serial so that they do not share an array instance of removeTrackedClansResponse
test.serial('removeClans valid input list', removeClans, ['123', '456'], removedMessage);
test.serial('removeClans mixed validity input list', removeClans, ['123', '456', 'testing'], removedMessage);

const showClanList = (t: ExecutionContext, expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    const actual = clanManager.showClanList();

    t.deepEqual(actual, expected);
};

test('showClanList', showClanList, ['**TesT**: 123\n**\\_TAG\\_**: 456\n**\\_clan**: 789\n']);
