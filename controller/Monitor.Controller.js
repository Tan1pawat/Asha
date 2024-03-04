import data from '../database/index.js';
import bcrypt from 'bcrypt';


const MonitorController = {
    createAccount: async (req, res) => {
        try {
            const { user_email, first_name, last_name, password, contactnumber} = req.body
            const [user] = await data.query("select * from users where user_email = ?", [user_email])
            if (user[0]) return res.json({ error: "Email already exists!" })
            

            const hash = await bcrypt.hash(password, 10)

            const sql = "insert into users (user_email, password, first_name, last_name, contactnumber,Priority) values (?, ?, ?, ?, ?, ?)"
            const [rows, fields] = await data.query(sql, [user_email, hash, first_name, last_name, contactnumber,1])

            if (rows.affectedRows) {               
                return res.json({ message: "Ok"})

            } else {
                return res.json({ error: "Error" })
            }
            
        } catch (error) {
            console.log(error)
            res.json({
                error: error.message
            })
        }
    }
};

export default MonitorController;
