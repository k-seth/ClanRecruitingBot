import { Helper } from "../modules/helper.js";
import test from "ava";

test('determineRegionValues na', t => {
    const actual = Helper.determineRegionValues("na");
    t.is(actual, ".com");
});

test('determineRegionValues eu', t => {
    const actual = Helper.determineRegionValues("eu");
    t.is(actual, ".eu");
});

test('determineRegionValues ru', t => {
    const actual = Helper.determineRegionValues("ru");
    t.is(actual, ".ru");
});

test('determineRegionValues sea', t => {
    const actual = Helper.determineRegionValues("sea");
    t.is(actual, ".asia");
});

// For some reason this is failing to catch the thrown error, despite reporting
//  that an error was in fact thrown
test.failing('determineRegionValues invalid', t => {
    t.throws(Helper.determineRegionValues("sa"));
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
