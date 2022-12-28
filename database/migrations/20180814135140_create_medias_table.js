'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('medias', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER.UNSIGNED
			},
			marker_id: {
				allowNull: false,
				type: Sequelize.INTEGER.UNSIGNED,
				onDelete: 'CASCADE',
				references: {
					model: {
						tableName: 'markers',
					},
					key: 'id',
				}
			},
			type: {
				allowNull: true,
				type: Sequelize.STRING
			},
			path: {
				allowNull: true,
				type: Sequelize.STRING
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
		await queryInterface.dropTable('medias');
	}
};