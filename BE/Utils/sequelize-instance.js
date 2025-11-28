const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../config.env') });

let sequelizeInstance = null;

function getSequelizeInstance() {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(
      process.env.DB_NAME || 'smarthome',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || 'buithanhTan@123',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: false,
          freezeTableName: true
        }
      }
    );

    // Test connection
    sequelizeInstance.authenticate()
      .then(() => {
        console.log('✅ Database connection established successfully.');
      })
      .catch(err => {
        console.error('❌ Unable to connect to the database:', err);
      });
  }

  return sequelizeInstance;
}

module.exports = getSequelizeInstance;