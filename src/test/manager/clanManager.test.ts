import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import test, { ExecutionContext } from 'ava';
import { ApiError } from '../../app/error/ApiError';
import { ApiService } from '../../app/service/apiService';
import { Clan } from '../../app/object/clan';
import { ClanListService } from '../../app/service/clanListService';
import { ClanManager } from '../../app/manager/clanManager';

let sandbox: SinonSandbox;
let clanListService: SinonStubbedInstance<ClanListService>;
let apiService: SinonStubbedInstance<ApiService>;
let clanManager: ClanManager;

let testClanList: Map<number, Clan>;

let addTrackedClansResponse: Map<number, Clan>;
let removeTrackedClansResponse: Map<number, Clan>;

const addedMessage = ['Successfully added:', '**Test1**: 1234', '**Test2**: 5678'];
const removedMessage = ['Successfully removed:', '**Test1**: 123', '**Test2**: 456'];

test.beforeEach(() => {
    sandbox = sinon.createSandbox();
    apiService = sandbox.createStubInstance(ApiService);
    clanListService = sandbox.createStubInstance(ClanListService);
    clanManager = new ClanManager(apiService as unknown as ApiService, null, clanListService as unknown as ClanListService);

    testClanList = new Map<number, Clan>();
    testClanList.set(123, new Clan(123, 'TesT', null));
    testClanList.set(456, new Clan(456, '_TAG_', null));
    testClanList.set(789, new Clan(789, '_clan', null));

    addTrackedClansResponse = new Map<number, Clan>();
    addTrackedClansResponse.set(1234, new Clan(1234, 'Test1', null));
    addTrackedClansResponse.set(5678, new Clan(5678, 'Test2', null));

    removeTrackedClansResponse = new Map<number, Clan>();
    removeTrackedClansResponse.set(123, new Clan(123, 'Test1', null));
    removeTrackedClansResponse.set(456, new Clan(456, 'Test2', null));
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

test('addClans empty input', addClans, [], ['No clans supplied.']);
test('addClans invalid format input', addClans, ['testClan', '12345t'], ['None of the requested clans are valid.']);
test('addClans existing clans in input', addClans, ['123', '456'], ['None of the requested clans are valid.']);

// These all need to be serial due to the extra stubbing of the API call
test.serial('addClans valid input list', addClans, ['1234', '5678'], addedMessage);
test.serial('addClans mixed validity input list', addClans, ['1234', '5678', '1111'], addedMessage);

test.serial('addClans api error', async t => {
    const expected = ['Error'];

    clanListService.getClanList.returns(testClanList);
    apiService.fetchClanData.throws(new ApiError('Error'));
    const actual = await clanManager.addClans(['1234', '5678']);

    t.deepEqual(actual, expected);
});

test.serial('addClans all data invalid', async t => {
    const expected = ['None of the requested clans are valid.'];

    clanListService.getClanList.returns(testClanList);
    apiService.fetchClanData.returns(new Map<number, Clan>());
    const actual = await clanManager.addClans(['1234', '5678']);

    t.deepEqual(actual, expected);
});

const removeClans = (t: ExecutionContext, clansToRemove: string[], expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    clanListService.removeClans.returns(removeTrackedClansResponse);
    const actual = clanManager.removeClans(clansToRemove);

    t.deepEqual(actual, expected);
};

test('removeClans empty input', removeClans, [], ['No clans supplied.']);
test('removeClans invalid format input', removeClans,
    ['testClan', '12345t'], ['None of the requested clans are valid.']);
test('removeClans nonexistent clans in input', removeClans,
    ['1234', '5690'], ['None of the requested clans are valid.']);

// The following two need to be serial so that they do not share an array instance of removeTrackedClansResponse
test.serial('removeClans valid input list', removeClans, ['123', '456'], removedMessage);
test.serial('removeClans mixed validity input list', removeClans, ['123', '456', 'testing'], removedMessage);

const showClanList = (t: ExecutionContext, expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    const actual = clanManager.showClanList();

    t.deepEqual(actual, expected);
};

test('showClanList', showClanList, ['**TesT**: 123', '**_TAG_**: 456', '**_clan**: 789']);
