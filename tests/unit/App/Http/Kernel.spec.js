import test from 'ava';
import sinon from 'sinon';
import { boot } from '../../../../App/Http/Kernel';

let kernelSpec;
let app;

test.beforeEach(t => {
	app = {
		use: sinon.spy()
	};
	kernelSpec = boot(app);
});

test.afterEach.always('Restore sinon', t => {
	sinon.restore();
});

test.serial('It registers pre middleware', async t => {
	kernelSpec.registerPreMiddleware();
	t.true(app.use.called);
});

test.serial('It registers post middleware', async t => {
	kernelSpec.registerPostMiddleware();
	t.true(app.use.called);
});