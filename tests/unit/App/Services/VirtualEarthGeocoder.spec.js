import test from 'ava';
import sinon from 'sinon';
import Http from '../../../../App/Services/HttpService.js';
import VirtualEarthGeocoder from '../../../../App/Services/VirtualEarthGeocoder.js';


const data = {
	resourceSets: [{
		resources: [{
			point: {
				coordinates: [0, 0]
			},
			address: {
				countryRegion: 'country',
				locality: 'city',
				adminDistrict: 'state',
				postalCode: 'zipcode',
				addressLine: 'streetName',
				formattedAddress: 'formattedAddress',
			},
		}]
	}]
};
const formatted = [{
	latitude: 0,
	longitude: 0,
	formattedAddress: 'formattedAddress',
	country: 'country',
	city: 'city',
	state: 'state',
	zipcode: 'zipcode',
	streetName: 'streetName',
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

	const response = await VirtualEarthGeocoder.geocode('Hayarden 10 haifa', {
		west: 0,
		east: 0,
		north: 0,
		south: 0
	});

	t.deepEqual(response, formatted);
	t.true(httpStub.calledOnce);
	t.true(httpStub.calledWith('https://dev.virtualearth.net/REST/v1/Locations'));
	t.deepEqual({
		userMapView: '0,0,0,0',
		query: 'Hayarden 10 haifa',
		key: process.env.BING_ACCESS_TOKEN
	}, httpStub.firstCall.args[1].params);
});

test.serial('It returns empty when geocode fails', async t => {
	sinon.stub(Http, 'get').returns({
		status: 500,
		data: []
	});

	const response = await VirtualEarthGeocoder.geocode('Hayarden 10 haifa', {
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
	const response = await VirtualEarthGeocoder.reverse({lat: 0, lng: 1});

	t.deepEqual(response, formatted);
	t.true(httpStub.calledOnce);
	t.true(httpStub.calledWith('https://dev.virtualearth.net/REST/v1/Locations/0,1'));
	t.deepEqual({
		key: process.env.BING_ACCESS_TOKEN
	}, httpStub.firstCall.args[1].params);
});

test.serial('It returns empty when reverse geocode fails', async t => {
	sinon.stub(Http, 'get').returns({
		status: 5000,
		data
	});
	const response = await VirtualEarthGeocoder.reverse({lat: 0, lng: 1});

	t.deepEqual(response, []);
});
