import { Api } from "../api.js";
import test from "ava";
import sinon from "sinon";

test.todo('callApi returns data');

test.todo('callApi returns api error');

test.todo('callApi returns data error');


test.serial('chunkedApiCall single chunk', async t => {
    const expected = {};
    const data = [];
    for (let i = 0; i < 20; i++) {
        data.push(i);
        expected[i] = `Value + ${i}`;
    }

    sinon.stub(Api, 'callApi').returns({ data: expected });

    const result = await Api.chunkedApiCall(data, "test/url", "requestId", "fields", "appId");

    Api.callApi.restore();

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

    sinon.stub(Api, 'callApi')
         .onFirstCall().returns({ data: apiReturnOne })
         .onSecondCall().returns({ data: apiReturnTwo });

    const result = await Api.chunkedApiCall(data, "test/url", "requestId", "fields", "appId");

    Api.callApi.restore();

    t.deepEqual(result, expected);
});

test.serial('chunkedApiCall returned error', async t => {
    const data = [];
    for (let i = 0; i < 20; i++) {
        data.push(i);
    }

    const ERR_API = { result: "An unexpected error occurred contacting the Wargaming API" };
    sinon.stub(Api, 'callApi').returns(ERR_API);

    const result = await Api.chunkedApiCall(data, "test/url", "requestId", "fields", "appId");

    Api.callApi.restore();

    t.deepEqual(result, ERR_API);
});
