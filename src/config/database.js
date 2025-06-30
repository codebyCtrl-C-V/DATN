const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,    
  process.env.DB_USER,    
  process.env.DB_PASS,
  { 
  dialect: process.env.DB_DIALECT,  
  host: process.env.DB_HOST,  
  port: process.env.DB_PORT,        
  logging: false,    
  timezone: '+07:00', // Thiết lập múi giờ cho Việt Nam
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
