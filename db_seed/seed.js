require('dotenv').config();

function seed() {
	return new Promise(async (resolve, reject) => {
		try {
			await require('./seedUsersTable')();
			resolve();
		} catch (error) {
			reject(error);
		}
	});
}


seed().then(() => {
	console.log('success');
	process.exit();
}).catch((error) => {
	console.log(error);
	process.exit();
});
