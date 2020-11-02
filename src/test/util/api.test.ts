import test, { ExecutionContext } from 'ava';
import axios from 'axios';
import sinon from 'sinon';
import { Api } from '../../app/util/api';

const apiError = { result: 'An unexpected error occurred contacting the Wargaming API.' };
const dataError = { result: 'An unexpected error occurred with the data returned by Wargaming.' };
const clanData = { data: { 100: { clan_id: '100' } } };

const callApi = async (t: ExecutionContext, apiData: {}, expected: {}) => {
    const axiosStub = sinon.stub(axios, 'post').resolves(Promise.resolve(apiData));
    const actual = await Api.callApi('testUrl', null);
    axiosStub.restore();

    t.deepEqual(actual, expected);
};

test.serial('callApi returns data', callApi, { status: 200, data: clanData }, clanData);
test.serial('callApi returns data error', callApi, { status: 200, data: { status: 'error' } }, dataError);
test.serial('callApi returns api error', callApi, { status: 'error' }, apiError);


test.serial('chunkedApiCall single chunk', async t => {
    const expected = {};
    const data = [];
    for (let i = 0; i < 20; i++) {
        data.push(i);
        expected[i] = `Value + ${i}`;
    }

    const callApiStub = sinon.stub(Api, 'callApi').returns({ data: expected });
    const result = await Api.chunkedApiCall(data, 'test/url', 'requestId', 'fields', 'appId');
    callApiStub.restore();

    t.deepEqual(result, expected);
});

test.serial('chunkedApiCall multiple chunks', async t => {
    const expected = {};
    const data = [];
    const apiReturnOne = {};
    const apiReturnTwo = {};

    for (let i = 0; i < 120; i++) {
        data.push(i);
        expected[i] = `Value + ${i}`;
        if (i < 100) {
            apiReturnOne[i] = `Value + ${i}`;
        } else {
            apiReturnTwo[i] = `Value + ${i}`;
        }
    }

    const callApiStub = sinon.stub(Api, 'callApi')
         .onFirstCall().returns({ data: apiReturnOne })
         .onSecondCall().returns({ data: apiReturnTwo });

    const result = await Api.chunkedApiCall(data, 'test/url', 'requestId', 'fields', 'appId');
    callApiStub.restore();

    t.deepEqual(result, expected);
});

test.serial('chunkedApiCall returned error', async t => {
    const data = [];
    for (let i = 0; i < 20; i++) {
        data.push(i);
    }

    const callApiStub = sinon.stub(Api, 'callApi').returns(apiError);
    const result = await Api.chunkedApiCall(data, 'test/url', 'requestId', 'fields', 'appId');
    callApiStub.restore();

    t.deepEqual(result, apiError);
});
