import chalk from 'chalk';
import User from '../../Models/User.js';
import Cache from '../../Services/CacheService.js';

class CreateUser {
	constructor() {
	}

	async handle(name, email, password) {
		console.log(chalk.yellow(`Creating user`));

		try {
			const user = new User();
			user.username = name;
			user.email = email;
			user.set('password', password);
			await user.save();
			await Cache.tag(['user_search']).flush();


			console.log(chalk.green(`User created successfully`));
		} catch (error) {
			console.log(chalk.red(`User creation failed with the following error`, error));
		}
	}
}

CreateUser.signature = "create:user <name> <email> <password>";
CreateUser.description = "description";

export default CreateUser;
