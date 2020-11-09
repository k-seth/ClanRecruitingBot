import test, { ExecutionContext } from 'ava';
import { ServerError } from '../../app/error/ServerError';
import { Util } from '../../app/util/util';

const determineApiDomain = (t: ExecutionContext, input: string, expected: string) => {
    const actual = Util.determineApiDomain(input);
    t.is(actual, expected);
};

test('determineApiDomain na server', determineApiDomain, 'na', '.com');
test('determineApiDomain eu server', determineApiDomain, 'eu', '.eu');
test('determineApiDomain ru server', determineApiDomain, 'ru', '.ru');
test('determineApiDomain sea server', determineApiDomain, 'sea', '.asia');

test('determineRegionValues invalid server', t => {
    const error = t.throws(() => Util.determineApiDomain('sa'), {instanceOf: ServerError});
    t.is(error.name, 'ServerError');
    t.is(error.message, 'Invalid server selected');
});

const discordify = (t: ExecutionContext, input: string[], expected: string[]) => {
    const actual = Util.discordify(input);
    t.deepEqual(actual, expected);
};

test('discordify escape underscores', discordify, ['Test _underscore_ replacement'], ['Test \\_underscore\\_ replacement\n']);
test('discordify combine messages', discordify, ['Message one', 'Message two'], ['Message one\nMessage two\n']);
