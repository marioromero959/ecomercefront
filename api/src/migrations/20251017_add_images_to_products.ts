import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

async function up() {
  try {
    await sequelize.getQueryInterface().addColumn('products', 'images', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    });

    console.log('Added images column to products table');
  } catch (error) {
    console.error('Error adding images column:', error);
    throw error;
  }
}

async function down() {
  try {
    await sequelize.getQueryInterface().removeColumn('products', 'images');
    console.log('Removed images column from products table');
  } catch (error) {
    console.error('Error removing images column:', error);
    throw error;
  }
}

up().catch(console.error);