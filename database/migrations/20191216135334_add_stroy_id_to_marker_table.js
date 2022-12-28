'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('markers','story_id',{
			allowNull: true,
			type: Sequelize.INTEGER.UNSIGNED,
			//TODO: Enable this once stories is created
			// onDelete: 'CASCADE',
			// references: {
			// 	model: {
			// 		tableName: 'stories',
			// 	},
			// 	key: 'id',
			// }

		})
	},

	async down(queryInterface, Sequelize) {
		//TODO: Enable this once stories is created
		// await queryInterface.removeConstraint('markers','stories_ibfk_1')
		await queryInterface.removeColumn('markers','story_id');
	}
};
