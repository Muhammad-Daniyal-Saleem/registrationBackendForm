const jwt = require('jsonwebtoken')
const User = require('../models/registeruser')

const auth = async (req, res, next) => {
    try {
        const cookieToken = req.cookies.jwt; // get the cookie token value
        const verifyUser = jwt.verify(cookieToken, process.env.SECRET_KEY) // verify the cookie token & token in database those are same 
        // console.log(verifyUser);
        const userInfo = await User.findOne({_id: verifyUser._id})
        // console.log(userInfo);
        req.token = cookieToken // istrhn hm isko app.js pr logout pr yeh chez use krskty hen
        req.user = userInfo
        next()
    } catch (error) {
        res.status(401).send(error)
    }
}

module.exports = auth;