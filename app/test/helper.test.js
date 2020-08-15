import { Helper } from "../modules/helper.js";
import test from "ava";

test('checkChanges null simplifiedOld', t => {
    const helper = new  Helper(null);
    const simplifiedOld = null;
    helper.checkChanges(simplifiedOld);

    t.is(simplifiedOld, null);
});

test('checkChanges empty simplifiedOld', t => {
    const helper = new  Helper(null);
    const simplifiedOld = {};
    helper.checkChanges(simplifiedOld);

    t.deepEqual(simplifiedOld, {});
});

test('checkChanges no changes simplifiedOld', t => {
    const helper = new  Helper({
        "clanlist": [ 2000000000 ]
    });
    const simplifiedOld = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };

    helper.checkChanges(simplifiedOld);

    t.deepEqual(simplifiedOld, expected);
});

test('checkChanges removed clan simplifiedOld', t => {
    const helper = new  Helper({
        "clanlist": [ 2000000000 ]
    });
    const simplifiedOld = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" },
        "1000000001": { clan_id: "2000000001", clan_tag: "TEST2" }
    };
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };

    helper.checkChanges(simplifiedOld);

    t.deepEqual(simplifiedOld, expected);
});

test('checkChanges add clan simplifiedOld', t => {
    const helper = new  Helper({
        "clanlist": [ 2000000000, 2000000001 ]
    });
    const simplifiedOld = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" },
    };
    const expected = {
        "1000000000": { clan_id: "2000000000", clan_tag: "TEST" }
    };

    helper.checkChanges(simplifiedOld);

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
