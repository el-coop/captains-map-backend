'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('followers', {
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
			endpoint: {
				allowNull: false,
				type: Sequelize.STRING
			},
			subscription: {
				allowNull: false,
				type: Sequelize.JSON
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

		await queryInterface.addIndex('followers',{
			fields: ['user_id', 'endpoint'],
			unique: true
		});

		await queryInterface.addIndex('followers',{
			fields: ['endpoint'],
		});

	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('followers');
	}
};