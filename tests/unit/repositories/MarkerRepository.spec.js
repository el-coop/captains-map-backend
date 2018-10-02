import test from 'ava';
import MarkerRepository from '../../../repositories/MarkerRepository';
import knex from "../../../database/knex";
import MarkerFactory from "../../../database/factories/MarkerFactory";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});

test.serial('It returns first page of Markers with hasNext false when less than page size',async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	},3);

	const result = await MarkerRepository.getPage();

	t.is(3, result.markers.length);
	markers.forEach((marker) => {
		t.not(null,result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});

test.serial('It returns first page of Markers with hasNext true when more than page size',async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	},4);

	const result = await MarkerRepository.getPage();

	t.is(3, result.markers.length);
	markers.forEach((marker) => {
		t.not(null,result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.true(result.pagination.hasNext);
});

test.serial('It returns page after specific id',async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	},5);

	const result = await MarkerRepository.getPage(markers[2].id);

	t.is(2, result.markers.length);
	markers.slice(-2).forEach((marker) => {
		t.not(null,result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});


test.serial('It returns user page',async t => {
	const userMarkers = await MarkerFactory.create({
		user_id: 1,
	},2);
	const otherMarkers = await MarkerFactory.create({
		user_id: 2,
	},2);

	const result = await MarkerRepository.getPage(false,1);

	t.is(2, result.markers.length);
	userMarkers.forEach((marker) => {
		t.not(null,result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});
