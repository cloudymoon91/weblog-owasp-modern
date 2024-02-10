
const jwt = require('jsonwebtoken')

const requireAuth = (req, res, next) => {
    const { token } = req.cookies
    const secretKey = 'your_secret_key';
    if (token) {
        try {
            const decoded = jwt.verify(token , secretKey);
            if (decoded) {
                res.locals.decoded = decoded
                next();
            } else {
                res.redirect("/auth/login")
            }
        }catch (error) {
            console.log(error)
            res.redirect('/auth/login')
        }
    } else {
        res.redirect('/auth/login')
    }
}

module.exports = {requireAuth};