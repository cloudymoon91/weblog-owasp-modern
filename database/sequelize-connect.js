const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    'modern',
    'modern',
    'securepassword_secp',
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

module.exports = sequelize;