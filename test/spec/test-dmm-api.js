'use strict';

const DmmApi = require('../../src/dmm/osapi');
const Account = require('../../src/dmm/account');
const sinon = require('sinon');
const async = require('async');
const rp = require('request-promise');
const netGame = require('../mock/dmm/net-game');

describe('DMM API (OSAPI)', function() {

	var osapi, account;
	var stubCookie;
	var fakeGameId, fakeCookie;

	beforeEach(function() {
		account = new Account('poi@poi.com', 'poipoi');
		osapi = new DmmApi(account);

		fakeGameId = 0;
		fakeCookie = 'INT_SESID=abcd; ccky=1; cklg=ja; a=1; b=2;';
		stubCookie = sinon.stub(account, 'getCookie').returns(fakeCookie);
	})

	afterEach(function() {
		stubCookie.restore();
	})

	it('get expected gadget information', sinon.test(function(done) {

		var httpRequest = this.spy(rp, 'get');

		osapi.getGameInfo(fakeGameId, function(error, gadgetInfo) {
			var rpParam = httpRequest.firstCall.args[0];
			assert.equal(rpParam.uri, 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=' + fakeGameId, 'http url should match');
			assert.equal(rpParam.headers.cookie, account.getCookie(), 'cookie should not be altered');

			var expectedParsedGadget = {
			    VIEWER_ID : 123,
			    OWNER_ID  : 123,
			    APP_ID    : 456,
			    URL       : "http://www.example.com",
			    FRAME_ID  : "game_frame",
			    ST        : "0123456789abcdefghijklmnopqrstuvwxyz",
			    TIME      : 1467570034,
			    TYPE      : "",
			    SV_CD     : "xx_xxxxxx"
			};

			assert.isNull(error);
			assert.deepEqual(gadgetInfo, expectedParsedGadget, 'gadgetInfo should have the same expected properties and values');	
			done();
		});
	}))

	it('should return error when there is no gadgetInfo variable', sinon.test(function() {
		var httpRequest = this.stub(rp, 'get').returns(getFakeResponse(''));
		osapi.getGameInfo(fakeGameId, function(error, gadgetInfo) {
			assert.isUndefined(gadgetInfo, 'gadget info should not have any value');
			assert.isNotNull(error, 'there should be an error');
			assert.isDefined(error, 'error should be defined');
		})
	}))
})

function getFakeResponse(htmlBody) {
	return {
		then: function(htmlCallback) { htmlCallback(htmlBody); return this; },
		catch: function() {}
	}
}