import test from 'ava';
import sinon from 'sinon';
import Http from '../../../../App/Services/HttpService.js';
import OpenStreetMapGeocoder from '../../../../App/Services/OpenStreetMapGeocoder.js';


const data = [{
	lat: 0,
	lon: 0,
	display_name: 'display_name',
	address: {
		country: 'country',
		city: 'city',
		state: 'state',
		postcode: 'zipcode',
		road: 'streetName',
		house_number: 'house_number',
		countryCode: 'countryCode',
		neighbourhood: 'neighbourhood'
	},
}];
const formatted = [{
	latitude: 0,
	longitude: 0,
	formattedAddress: 'display_name',
	country: 'country',
	city: 'city',
	state: 'state',
	zipcode: 'zipcode',
	streetName: 'streetName',
	streetNumber: 'house_number',
	countryCode: 'countryCode',
	neighbourhood: 'neighbourhood'
}];

test.beforeEach(t => {

});

test.afterEach.always(t => {
	sinon.restore();
});

test.serial('It geocodes', async t => {
	const httpStub = sinon.stub(Http, 'get').returns({
		status: 200,
		data
	});

	const response = await OpenStreetMapGeocoder.geocode('Hayarden 10 haifa', {
		west: 0,
		east: 0,
		north: 0,
		south: 0
	});

	t.deepEqual(response, formatted);
	t.true(httpStub.calledOnce);
	t.true(httpStub.calledWith('https://nominatim.openstreetmap.org/search/Hayarden 10 haifa'));
	t.deepEqual({
		viewbox: `0,0,0,0`,
		addressdetails: 1,
		format: 'json',
		'accept-language': 'en'
	}, httpStub.firstCall.args[1].params);
});

test.serial('It returns empty when geocode fails', async t => {
	sinon.stub(Http, 'get').returns({
		status: 500,
		data: []
	});

	const response = await OpenStreetMapGeocoder.geocode('Hayarden 10 haifa', {
		west: 0,
		east: 0,
		north: 0,
		south: 0
	});

	t.deepEqual(response, []);
	t.deepEqual(response, []);
});


test.serial('It reverse geocodes', async t => {
	const httpStub = sinon.stub(Http, 'get').returns({
		status: 200,
		data
	});
	const response = await OpenStreetMapGeocoder.reverse({lat: 0, lng: 1});

	t.deepEqual(response, formatted);
	t.true(httpStub.calledOnce);
	t.true(httpStub.calledWith('https://nominatim.openstreetmap.org/reverse'));
	t.deepEqual({
		lat: 0,
		lon: 1,
		format: 'json',
		'accept-language': 'en',
		addressdetails: 1,
	}, httpStub.firstCall.args[1].params);
});

test.serial('It returns empty when reverse geocode fails', async t => {
	sinon.stub(Http, 'get').returns({
		status: 5000,
		data
	});
	const response = await OpenStreetMapGeocoder.reverse({lat: 0, lng: 1});

	t.deepEqual(response, []);
});
