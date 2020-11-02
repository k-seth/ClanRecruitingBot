import test, { ExecutionContext } from 'ava';
import { Clan } from '../../app/object/clan';

test('Can create clan object', t => {
    const clan: Clan = new Clan(12345, 'TesT');
    t.is(clan.id, 12345);
});

const getTag = (t: ExecutionContext, tag: string) => {
    const clan: Clan = new Clan(1234, tag);
    t.is(clan.getTag(), tag);
};

test('getTag "TesT"', getTag, 'TesT');
test('getTag "tag"', getTag, 'tag');

const setTag = (t: ExecutionContext, tag: string) => {
    const clan: Clan = new Clan(1234, 'Fill');
    clan.setTag(tag);
    t.is(clan.getTag(), tag);
};

test('setTag "test"', setTag, 'test');
test('setTag "set"', setTag, 'set');

const getClanInfo = (t: ExecutionContext, id: number, tag: string, expected: string) => {
    const clan: Clan = new Clan(id, tag);
    t.is(clan.getClanInfo(), expected);
};

test('getClanInfo "12345, TesT"', getClanInfo, 12345, 'TesT', '12345 - TesT');
test('getClanInfo "98765, tag"', getClanInfo, 98765, 'tag', '98765 - tag');
test('getClanInfo "11111, _tag_"', getClanInfo, 11111, '_tag_', '11111 - _tag_');
