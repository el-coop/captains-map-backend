'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up({context: {queryInterface, DataTypes}}) {
		await queryInterface.createTable('Users', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
			username: {
				type: DataTypes.STRING
			},
			email: {
				type: DataTypes.STRING
			},
			password: {
				type: DataTypes.STRING
			},
			created_at: {
				allowNull: false,
				type: DataTypes.DATE
			},
			updated_at: {
				allowNull: false,
				type: DataTypes.DATE
			}
		});
	},

	async down({context: {queryInterface}}) {
		await queryInterface.dropTable('Users');
	}
};
