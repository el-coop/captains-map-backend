import test from 'ava';
import MarkerRepository from '../../../../App/Repositories/MarkerRepository';
import knex from "../../../../database/knex";
import MarkerFactory from "../../../../database/factories/MarkerFactory";

test.beforeEach(async () => {
	await knex.migrate.latest();
	await knex.seed.run();
});

test.afterEach.always(async () => {
	await knex.migrate.rollback();
});

test.serial('It returns first page of Markers with hasNext false when less than page size', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 3);

	const result = await MarkerRepository.getPage();

	t.is(3, result.markers.length);
	markers.forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});

test.serial('It returns first page of Markers with hasNext true when more than page size', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 4);

	const result = await MarkerRepository.getPage();

	t.is(3, result.markers.length);
	markers.slice(-1).forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.true(result.pagination.hasNext);
});

test.serial('It returns page after specific id', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 5);

	const result = await MarkerRepository.getPage({
		startId: markers[2].id
	});

	t.is(2, result.markers.length);
	markers.slice(0, 2).forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});


test.serial('It returns user page', async t => {
	const userMarkers = await MarkerFactory.create({
		user_id: 1,
	}, 2);
	await MarkerFactory.create({
		user_id: 2,
	}, 2);

	const result = await MarkerRepository.getPage({
		user: 1
	});

	t.is(2, result.markers.length);
	userMarkers.forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});

test.serial('It returns user page starting at marker', async t => {
	const userMarkers = await MarkerFactory.create({
		user_id: 1,
	}, 2);
	await MarkerFactory.create({
		user_id: 2,
	}, 2);

	const userMarkers2 = await MarkerFactory.create({
		user_id: 1,
	}, 2);

	const result = await MarkerRepository.getPage({
		user: 1,
		startId: userMarkers2[1].id
	});

	t.is(3, result.markers.length);
	userMarkers.forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.not(undefined, result.markers.find((item) => {
		return item.id === userMarkers2[0].id;
	}));
	t.false(result.pagination.hasNext);
});

test.serial('It returns page with specific marker in it', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 9);

	const result = await MarkerRepository.getObjectPage(markers[5].id, 1);

	t.is(3, result.markers.length);
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[3].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[4].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[5].id;
	}));
	t.true(result.pagination.hasNext);
	t.is(result.pagination.page, 1);
});

test.serial('It returns page with specific marker in for specific user', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 2);
	await MarkerFactory.create({
		user_id: 2,
	}, 5);
	const pivotMarker = await MarkerFactory.create({
		user_id: 1,
	});
	await MarkerFactory.create({
		user_id: 2,
	}, 2);
	const nextMarker = await MarkerFactory.create({
		user_id: 1,
	});

	const result = await MarkerRepository.getObjectPage(pivotMarker.id, 1);

	t.is(3, result.markers.length);
	t.not(undefined, result.markers.find((item) => {
		return item.id === nextMarker.id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[1].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === pivotMarker.id;
	}));
	t.true(result.pagination.hasNext);
	t.is(result.pagination.page, 0);
});

test.serial('It returns last page with hasNext false', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 9);

	const result = await MarkerRepository.getObjectPage(markers[0].id, 1);

	t.is(3, result.markers.length);
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[0].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[1].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[2].id;
	}));
	t.false(result.pagination.hasNext);
	t.is(result.pagination.page, 2);
});

test.serial('It returns first page with hasNext', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 9);

	const result = await MarkerRepository.getObjectPage(markers[8].id, 1);

	t.is(3, result.markers.length);
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[6].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[7].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[8].id;
	}));
	t.true(result.pagination.hasNext);
	t.is(result.pagination.page, 0);
});

test.serial('It returns false for not found object', async t => {
	await MarkerFactory.create({
		user_id: 1,
	}, 3);

	await t.throwsAsync(MarkerRepository.getObjectPage(20, 1), {
		message: 'EmptyResponse'
	});
});

test.serial('It returns previous page', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
	}, 9);

	const result = await MarkerRepository.getPreviousPage({
		startId: markers[5].id,
		user: 1
	});

	t.is(3, result.markers.length);
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[6].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[7].id;
	}));
	t.not(undefined, result.markers.find((item) => {
		return item.id === markers[8].id;
	}));
	t.is(result.pagination.hasNext, null);
	t.is(result.pagination.page, null);
});


test.serial('It returns markers within specific boundaries only', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
		lat: '0.5',
		lng: '0.5'
	}, 3);

	await MarkerFactory.create({
		user_id: 1,
		lat: '1.5',
		lng: '1.5'
	}, 3);


	const result = await MarkerRepository.getPage({
		borders: [{
			lat: 0,
			lng: 0
		}, {
			lat: 1,
			lng: 1
		}]
	});

	t.is(3, result.markers.length);
	markers.forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});

test.serial('It returns markers within specific boundaries only for specific user', async t => {
	const markers = await MarkerFactory.create({
		user_id: 1,
		lat: '0.5',
		lng: '0.5'
	}, 3);

	await MarkerFactory.create({
		user_id: 2,
		lat: '0.5',
		lng: '0.5'
	}, 3);

	await MarkerFactory.create({
		user_id: 1,
		lat: '1.5',
		lng: '1.5'
	}, 3);


	const result = await MarkerRepository.getPage({
		user: 1,
		borders: [{
			lat: 0,
			lng: 0
		}, {
			lat: 1,
			lng: 1
		}]
	});

	t.is(3, result.markers.length);
	markers.forEach((marker) => {
		t.not(undefined, result.markers.find((item) => {
			return item.id === marker.id;
		}))
	});
	t.false(result.pagination.hasNext);
});
