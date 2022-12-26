
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const User = (await import('../../../App/Models/User.js')).default;

		const user = new User();

		user.username = 'nur';
		user.email = 'nur@elcoop.io';
		user.password = '123456';

		await user.save();

	},

	async down(queryInterface, Sequelize) {
	}
};
