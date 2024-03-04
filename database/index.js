import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'asha'
});

connection.connect((err) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MySQL: ' + err.message);
    } else {
      console.log('เชื่อมต่อกับ MySQL สำเร็จ');
    }
  });

export default connection.promise()