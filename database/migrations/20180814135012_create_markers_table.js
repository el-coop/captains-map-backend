'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('markers', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			user_id: {
				allowNull: false,
				type: Sequelize.INTEGER.UNSIGNED,
				onDelete: 'CASCADE',
				references: {
					model: {
						tableName: 'users',
					},
					key: 'id',
				}
			},
			lat: {
				type: Sequelize.DOUBLE
			},
			lng: {
				type: Sequelize.DOUBLE
			},
			type: {
				type: Sequelize.STRING
			},
			location: {
				type: Sequelize.STRING
			},
			time: {
				type: 'timestamp'
			},
			description: {
				type: Sequelize.TEXT
			},
			created_at: {
				allowNull: false,
				type: 'timestamp'
			},
			updated_at: {
				allowNull: false,
				type: 'timestamp'
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('markers');
	}
};