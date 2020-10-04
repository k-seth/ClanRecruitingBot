import { Helper } from "../modules/helper.js";
import { Api } from "../modules/api.js";
import test from "ava";
import sinon from "sinon";

test('checkChanges null simplifiedOld', t => {
    const simplifiedOld = null;
    Helper.checkChanges(simplifiedOld);

    t.is(simplifiedOld, null);
});

test('checkChanges empty simplifiedOld', t => {
    const simplifiedOld = {};
    Helper.checkChanges(simplifiedOld);

    t.deepEqual(simplifiedOld, {});
});

test('checkChanges no changes simplifiedOld', t => {
    const clanList = [ 2000000000 ];
    const simplifiedOld = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };

    Helper.checkChanges(simplifiedOld, clanList);

    t.deepEqual(simplifiedOld, expected);
});

test('checkChanges removed clan simplifiedOld', t => {
    const clanList = [ 2000000000 ];
    const simplifiedOld = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" },
        "1000000001": { clan_id: "2000000001", clan_tag: "TEST2" }
    };
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };

    Helper.checkChanges(simplifiedOld, clanList);

    t.deepEqual(simplifiedOld, expected);
});

test('checkChanges added clan simplifiedOld', t => {
    const clanList = [ 2000000000, 2000000001 ];
    const simplifiedOld = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" },
    };
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };

    Helper.checkChanges(simplifiedOld, clanList);

    t.deepEqual(simplifiedOld, expected);
});


test('findClanlist default list', async t => {
    const helper = new  Helper({
        "clanlist": [ 2000000000, 2000000001 ]
    });
    const expected = [ 2000000000, 2000000001 ];

    const list = await helper.findClanlist();

    t.deepEqual(list, expected);
});

test.todo('findClanlist list from file');


test('determineRegionValues na server', t => {
    const actual = Helper.determineRegionValues("na");
    t.is(actual, ".com");
});

test('determineRegionValues eu server', t => {
    const actual = Helper.determineRegionValues("eu");
    t.is(actual, ".eu");
});

test('determineRegionValues ru server', t => {
    const actual = Helper.determineRegionValues("ru");
    t.is(actual, ".ru");
});

test('determineRegionValues sea server', t => {
    const actual = Helper.determineRegionValues("sea");
    t.is(actual, ".asia");
});

test('determineRegionValues invalid server', t => {
    const error = t.throws(() => { Helper.determineRegionValues("sa") }, {instanceOf: Error});
    t.is(error.message, "Invalid region selected");
});


test('simplifyRoster null newRoster', t => {
   t.deepEqual(Helper.simplifyRoster(null), {});
});

test('simplifyRoster empty newRoster', t => {
    t.deepEqual(Helper.simplifyRoster({}), {});
});

test('simplifyRoster single clan newRoster', t => {
    const newRoster = {
        "2000000000": {
            "tag": "TEST",
            "members": [
                { "account_id": 1000000000 },
                { "account_id": 1000000001 }
            ]
        }
    }
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" },
        "1000000001": { clan_id: "2000000000", clan_tag: "TEST" }
    }

    t.deepEqual(Helper.simplifyRoster(newRoster), expected);
});

test('simplifyRoster multi clan newRoster', t => {
    const newRoster = {
        "2000000000": {
            "tag": "TEST",
            "members": [
                { "account_id": 1000000000 },
                { "account_id": 1000000001 }
            ]
        },
        "2000000001": {
            "tag": "TEST2",
            "members": [
                { "account_id": 1000000002 }
            ]
        }
    }
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" },
        "1000000001": { clan_id: "2000000000", clan_tag: "TEST" },
        "1000000002": { clan_id: "2000000001", clan_tag: "TEST2" }
    }
    t.deepEqual(Helper.simplifyRoster(newRoster), expected);
});


test('sanitizeClanId empty list', t => {
    const clansToAddExpected = [];
    const invalidClansExpected = [];

    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = [];
    const result = Helper.sanitizeClanId(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test('sanitizeClanId single valid clan', t => {
    const clansToAddExpected = ["1000000000"];
    const invalidClansExpected = [];

    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["1000000000"];
    const result = Helper.sanitizeClanId(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test('sanitizeClanId multiple valid clans', t => {
    const clansToAddExpected = ["1000000000", "1000000001"];
    const invalidClansExpected = [];

    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["1000000000", "1000000001"];
    const result = Helper.sanitizeClanId(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test('sanitizeClanId single invalid clan', t => {
    const clansToAddExpected = [];
    const invalidClansExpected = ["100000000f"];

    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["100000000f"];
    const result = Helper.sanitizeClanId(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test('sanitizeClanId multiple invalid clans', t => {
    const clansToAddExpected = [];
    const invalidClansExpected = ["100000000f", "d00000000f"];

    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["100000000f", "d00000000f"];
    const result = Helper.sanitizeClanId(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test('sanitizeClanId mix invalid and valid clans', t => {
    const clansToAddExpected = ["1000000000"];
    const invalidClansExpected = ["d00000000f"];

    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["1000000000", "d00000000f"];
    const result = Helper.sanitizeClanId(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});


test.serial('validateClanList empty list', async t => {
    const clansToAddExpected = [];
    const invalidClansExpected = [];

    const sanitizeResult = { valid: [], invalid: [] };

    sinon.stub(Helper, 'sanitizeClanId').returns(sanitizeResult);

    const clansToAdd = [];
    const result = await Helper.validateClanList(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.sanitizeClanId.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test.serial('validateClanList single valid clan', async t => {
    const clansToAddExpected = ["1000000000"];
    const invalidClansExpected = [];

    const sanitizeResult = { valid: ["1000000000"], invalid: [] };
    const chunkedApiCallResult = { 1000000000: "Some value" };

    sinon.stub(Helper, 'sanitizeClanId').returns(sanitizeResult);
    sinon.stub(Api, 'chunkedApiCall').returns(chunkedApiCallResult);
    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["1000000000"];
    const result = await Helper.validateClanList(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.sanitizeClanId.restore();
    Api.chunkedApiCall.restore();
    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test.serial('validateClanList multiple valid clans', async t => {
    const clansToAddExpected = ["1000000000", "1000000001"];
    const invalidClansExpected = [];

    const sanitizeResult = { valid: ["1000000000", "1000000001"], invalid: [] };
    const chunkedApiCallResult = { 1000000000: "Some value", 1000000001: "Some value" };

    sinon.stub(Helper, 'sanitizeClanId').returns(sanitizeResult);
    sinon.stub(Api, 'chunkedApiCall').returns(chunkedApiCallResult);
    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["1000000000", "1000000001"];
    const result = await Helper.validateClanList(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.sanitizeClanId.restore();
    Api.chunkedApiCall.restore();
    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test.serial('validateClanList single invalid clan', async t => {
    const clansToAddExpected = [];
    const invalidClansExpected = ["9000000000"];

    const sanitizeResult = { valid: ["9000000000"], invalid: [] };
    const chunkedApiCallResult = { 9000000000: null };

    sinon.stub(Helper, 'sanitizeClanId').returns(sanitizeResult);
    sinon.stub(Api, 'chunkedApiCall').returns(chunkedApiCallResult);
    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["9000000000"];
    const result = await Helper.validateClanList(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.sanitizeClanId.restore();
    Api.chunkedApiCall.restore();
    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test.serial('validateClanList multiple invalid clans', async t => {
    const clansToAddExpected = [];
    const invalidClansExpected = ["9000000000", "9000000001"];

    const sanitizeResult = { valid: ["9000000000", "9000000001"], invalid: [] };
    const chunkedApiCallResult = { 9000000000: null, 9000000001: null };

    sinon.stub(Helper, 'sanitizeClanId').returns(sanitizeResult);
    sinon.stub(Api, 'chunkedApiCall').returns(chunkedApiCallResult);
    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["9000000000", "9000000001"];
    const result = await Helper.validateClanList(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.sanitizeClanId.restore();
    Api.chunkedApiCall.restore();
    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});

test.serial('validateClanList mixed valid and invalid clans', async t => {
    const clansToAddExpected = ["1000000000"];
    const invalidClansExpected = ["9000000000"];

    const sanitizeResult = { valid: ["1000000000", "9000000000"], invalid: [] };
    const chunkedApiCallResult = { 1000000000: "Some value", 9000000000: null };

    sinon.stub(Helper, 'sanitizeClanId').returns(sanitizeResult);
    sinon.stub(Api, 'chunkedApiCall').returns(chunkedApiCallResult);
    sinon.stub(Helper, 'removeInvalids').returns(clansToAddExpected);

    const clansToAdd = ["1000000000", "9000000000"];
    const result = await Helper.validateClanList(clansToAdd);

    const validClans = result.valid;
    const invalidClans = result.invalid;

    Helper.sanitizeClanId.restore();
    Api.chunkedApiCall.restore();
    Helper.removeInvalids.restore();

    t.deepEqual(validClans, clansToAddExpected);
    t.deepEqual(invalidClans, invalidClansExpected);
});


test('removeInvalids empty invalid list', t => {
    const clanList = ["1000000000", "1000000001"];
    const invalidClans = [];

    const clanListExpected = ["1000000000", "1000000001"];

    Helper.removeInvalids(clanList, invalidClans);

    t.deepEqual(clanList, clanListExpected);
});

test('removeInvalids single invalid clan', t => {
    const clanList = ["1000000000", "1000000001"];
    const invalidClans = ["1000000001"];

    const clanListExpected = ["1000000000"];

    Helper.removeInvalids(clanList, invalidClans);

    t.deepEqual(clanList, clanListExpected);
});

test('removeInvalids all invalid clans', t => {
    const clanList = ["1000000000", "1000000001"];
    const invalidClans = ["1000000000", "1000000001"];

    const clanListExpected = [];

    Helper.removeInvalids(clanList, invalidClans);

    t.deepEqual(clanList, clanListExpected);
});
