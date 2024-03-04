import express from 'express';
import Userrouter from './routes/user.route.js';
import Adminrouter from './routes/admin.route.js';
import Monitorrouter from './routes/monitor.route.js';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/user', Userrouter);
app.use('/admin', Adminrouter);
app.use('/monitor', Monitorrouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
