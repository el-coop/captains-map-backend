'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('medias', 'instagram_type', {
			allowNull: true,
			type: Sequelize.STRING,
			after: 'type'
		})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('medias','instagram_type');

	}
};
