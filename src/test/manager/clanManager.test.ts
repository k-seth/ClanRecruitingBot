import test, { ExecutionContext } from 'ava';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import { ClanManager } from '../../app/manager/clanManager';
import { Clan } from '../../app/object/clan';
import { ClanListService } from '../../app/service/clanListService';
import { Api } from '../../app/util/api';

let sandbox: SinonSandbox;
let clanListService: SinonStubbedInstance<ClanListService>;
let clanManager: ClanManager;

const testClanList: Clan[] = [
    new Clan(123, 'TesT'),
    new Clan(456, '_TAG_'),
    new Clan(789, '_clan')
];

let addTrackedClansResponse: string[];
let removeTrackedClansResponse: string[];

const addedMessage = ['Successfully added:\n1234\n5678\n\nPlayer data will be updated on next check.\n'];
const removedMessage = ['Successfully removed:\n123\n456\n\nPlayer data will be updated on next check.\n'];

test.beforeEach(() => {
    sandbox = sinon.createSandbox();
    clanListService = sandbox.createStubInstance(ClanListService);
    clanManager = new ClanManager(null, null, clanListService as unknown as ClanListService);

    addTrackedClansResponse = ['1234', '5678'];
    removeTrackedClansResponse = ['123', '456'];
});

test.afterEach(() => {
    sandbox.restore();
});

const addClans = async (t: ExecutionContext, clansToAdd: string[], expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    clanListService.addTrackedClans.returns(addTrackedClansResponse);
    const actual = await clanManager.addClans(clansToAdd);

    t.deepEqual(actual, expected);
};

test('addClans empty input', addClans, [], ['No clans supplied.\n']);
test('addClans invalid format input', addClans, ['testClan', '12345t'], ['None of the requested clans are valid.\n']);
test('addClans existing clans in input', addClans, ['123', '456'], ['None of the requested clans are valid.\n']);

const addClansWithApi = async (t: ExecutionContext, clansToAdd: string[], apiReturn: {}, expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    clanListService.addTrackedClans.returns(addTrackedClansResponse);

    sandbox.stub(Api, 'chunkedApiCall').returns(apiReturn);
    const actual = await clanManager.addClans(clansToAdd);

    t.deepEqual(actual, expected);
};

// These all need to be serial due to the extra stubbing of the API call
test.serial('addClans valid input list', addClansWithApi,
    ['1234', '5678'], { 1234: { tag: 'some'}, 5678: { tag: 'thing' }}, addedMessage);
test.serial('addClans mixed validity input list', addClansWithApi,
    ['1234', '5678', '1111'], { 1234: { tag: 'some'}, 5678: { tag: 'thing' }, 1111: null}, addedMessage);
test.serial('addClans api error', addClansWithApi, ['1234', '5678'], { result: 'Error' }, ['Error\n']);

const removeClans = async (t: ExecutionContext, clansToRemove: string[], expected: string[]) => {
    clanListService.getClanList.returns(testClanList);
    clanListService.removeTrackedClans.returns(removeTrackedClansResponse);
    const actual = await clanManager.removeClans(clansToRemove);

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

test('showClanList', showClanList, ['123 - TesT\n456 - \\_TAG\\_\n789 - \\_clan\n']);
