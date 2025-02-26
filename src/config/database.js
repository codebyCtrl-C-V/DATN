const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('datn', 'TRANDIEN', 'dien2004', { 
  dialect: 'mysql',  
  host: 'localhost',  
  port: 3306,        
  logging: false,    
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối thành công với cơ sở dữ liệu MySQL.');
  } catch (error) {
    console.error('❌ Không thể kết nối với cơ sở dữ liệu MySQL:', error);
  }
})();

module.exports = sequelize;
