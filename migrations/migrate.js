require('dotenv').config();

function migrate() {
	return new Promise(async (resolve, reject) => {
		try {
			await require('./create_user_table')();
			await require('./create_marker_table')();
			await require('./create_media_table')();
			resolve();
		} catch (error) {
			reject(error);
		}
	});

}


migrate().then(() => {
	console.log('success');
	process.exit();
}).catch((error) => {
	console.log(error);
	process.exit();
});
