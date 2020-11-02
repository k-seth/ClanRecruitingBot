import test, { ExecutionContext } from 'ava';
import { RegionError } from '../../app/error/RegionError';
import { Util } from '../../app/util/util';

const determineRegionValues = (t: ExecutionContext, input: string, expected: string) => {
    const actual = Util.determineRegionValues(input);
    t.is(actual, expected);
};

test('determineRegionValues na server', determineRegionValues, 'na', '.com');
test('determineRegionValues eu server', determineRegionValues, 'eu', '.eu');
test('determineRegionValues ru server', determineRegionValues, 'ru', '.ru');
test('determineRegionValues sea server', determineRegionValues, 'sea', '.asia');

test('determineRegionValues invalid server', t => {
    const error = t.throws(() => Util.determineRegionValues('sa'), {instanceOf: RegionError});
    t.is(error.name, 'RegionError');
    t.is(error.message, 'Invalid region selected');
});

const discordify = (t: ExecutionContext, input: string[], expected: string[]) => {
    const actual = Util.discordify(input);
    t.deepEqual(actual, expected);
};

test('discordify escape underscores', discordify, ['Test _underscore_ replacement'], ['Test \\_underscore\\_ replacement\n']);
test('discordify combine messages', discordify, ['Message one', 'Message two'], ['Message one\nMessage two\n']);
