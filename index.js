const express = require('express')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth.route')
const userRoutes = require('./routes/user.route')
const homeRoutes = require('./routes/home.route')
const adminRoutes = require('./routes/admin.route')
const sequelize = require('./database/sequelize-connect');
const {isAdmin} = require('./middlewares/auth.middleware');
const User = require('./models/user.model')
const path = require('path')
const app = express()
const port = 3000

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'statics')))

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/', homeRoutes)
app.use('/admin', isAdmin, adminRoutes)

app.listen(port, async () => {
   try {
       await sequelize.authenticate();
       await sequelize.sync({
        //    force: true
       })
       
       await adminUser()

       console.log('Connection has been established successfully.');
       console.log(`Example app listening on port ${port}`);
   } catch (error) {
       console.error('Unable to connect to the database:', error);
   }

})

async function adminUser() {
    const user = await User.findOne({
        where: {
            email: "admin@owasp.com"
        }
    })
    if (!user) {
        await User.create({
            firstName: "Admin",
            lastName: "Admin",
            username: "Admin",
            email: "admin@owasp.com",
            password: "1234",
            role: "admin"
        })
    }
}