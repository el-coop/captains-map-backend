'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('markers','story_id',{
			allowNull: true,
			type: Sequelize.INTEGER.UNSIGNED,
			onDelete: 'CASCADE',
			references: {
				model: {
					tableName: 'stories',
				},
				key: 'id',
			}

		})
	},

	async down(queryInterface, Sequelize) {
		const foreignKeys = await queryInterface.getForeignKeysForTables(['markers']);
		const storiesKey = foreignKeys['markers'].find((key) => {
			return key.includes('story');
		});
		if(storiesKey){
			await queryInterface.removeConstraint('markers',storiesKey)
		}
		await queryInterface.removeColumn('markers','story_id');
	}
};
