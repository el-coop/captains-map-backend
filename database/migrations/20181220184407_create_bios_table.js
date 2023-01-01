'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('bios', {
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
			path: {
				allowNull: true,
				type: Sequelize.STRING
			},
			description: {
				allowNull: true,
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
		await queryInterface.dropTable('bios');
	}
};