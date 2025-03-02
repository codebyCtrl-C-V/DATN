const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,    
  process.env.DB_USER,    
  process.env.DB_PASS,
  { 
  dialect: 'mysql',  
  host: 'localhost',  
  port: 3306,        
  logging: false,    
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối thành công với cơ sở dữ liệu MySQL.');
  } catch (error) {
    console.error('❌ Không thể kết nối với cơ sở dữ liệu MySQL:', error);
  }
})();

module.exports = sequelize;
