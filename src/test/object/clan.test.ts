import test, { ExecutionContext } from 'ava';
import { Clan } from '../../app/object/clan';
import { Player } from '../../app/object/player';

test('Can create clan object', t => {
    const clan: Clan = new Clan(12345, 'TesT', new Map<number, Player>());
    t.is(clan.id, 12345);
});

const getTag = (t: ExecutionContext, tag: string) => {
    const clan: Clan = new Clan(1234, tag, new Map<number, Player>());
    t.is(clan.getTag(), tag);
};

test('getTag "TesT"', getTag, 'TesT');
test('getTag "tag"', getTag, 'tag');

const setTag = (t: ExecutionContext, tag: string) => {
    const clan: Clan = new Clan(1234, 'Fill', new Map<number, Player>());
    clan.setTag(tag);
    t.is(clan.getTag(), tag);
};

test('setTag "test"', setTag, 'test');
test('setTag "set"', setTag, 'set');

const getClanInfo = (t: ExecutionContext, id: number, tag: string, expected: string) => {
    const clan: Clan = new Clan(id, tag, new Map<number, Player>());
    t.is(clan.getClanInfo(), expected);
};

test('getClanInfo "12345, TesT"', getClanInfo, 12345, 'TesT', '**TesT**: 12345');
test('getClanInfo "98765, tag"', getClanInfo, 98765, 'tag', '**tag**: 98765');
test('getClanInfo "11111, _tag_"', getClanInfo, 11111, '_tag_', '**_tag_**: 11111');

test.todo('Roster stuff');
