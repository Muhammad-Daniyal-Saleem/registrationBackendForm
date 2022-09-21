require('dotenv').config()
require('./db/connect')  // require & connect with database
const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const User = require('./models/registeruser')
const auth = require('./middleware/auth')
const port = process.env.PORT || '8000'


// middleware, incoming request values forms jo bh arhi ussy as a json object recognize krsky express islya
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // form ky andr jo bh likha hy ab ussy get krna kaly
app.use(cookieParser())


// Static website path and Host execute
const staticPath = path.join(__dirname, '../public')
// view directory change by custom name templates
templatePath = path.join(path.join(__dirname, '../template/views'))
// partial path
partialsPath = path.join(path.join(__dirname, '../template/partials'))

// to set the view engine(template engine)
app.set('view engine', 'hbs')
// view directory change by custom name templates
app.set('views', templatePath) // express ko btarha view ka path change hogya hy 
// register partial
hbs.registerPartials(partialsPath)

// builtin middleware
app.use(express.static(staticPath))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/about', auth, (req, res) => {
    res.render('about')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/logout', auth, async (req, res) => {
    try {
        // yeh dataBase sy bh dlt krrha token by filter - current cookie token ka ilawa sb token user document py save hojaenga 
        req.user.tokens = req.user.tokens.filter((currElem)=>{
            return currElem.token !== req.token
        })

        res.clearCookie('jwt')
        console.log('Logout Successfully');
        await req.user.save() // Rule: after logout data save krna hota hy  
        res.render('login')
    } catch (error) {
        res.status(500).send(error)
    }
})

// create a new user in database
app.post('/register', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                gender: req.body.gender,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            })
            
            // middleware - generate token - func call but define in schema file
            const token = await registerUser.generateAuthToken()
            // console.log(`Token : ${token}`);

            res.cookie('jwt', token, {
                expires:new Date(Date.now() + 600000),
                httpOnly:true // clintsite scripting lang iski values ka kuch nh krskta
            })

            // middleware ka kaam shuru - password hash - schema jhn define kra hoga wahn middlware define hy
            // data get krna ka bad or database ma save krna sy pehla yeh hashing hogi middleware ma

            const resultUser = await registerUser.save()

            res.status(201).render('index')
        } else {
            res.send('Invalid! password not match')
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

// login user from database
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email; // read data from login form fields
        const password = req.body.password;
        const userdbDoc = await User.findOne({ email: email }) // read data from database document

        const passwordMatch = await bcrypt.compare(password,userdbDoc.password) // dcrypt of hashing

        
        if (userdbDoc.email === email && passwordMatch) {

            const token = await userdbDoc.generateAuthToken()
            res.cookie('jwt', token, {
                expires:new Date(Date.now() + 600000),
                httpOnly:true // clintsite scripting lang iski values ka kuch nh krskta
            })
            
            res.status(201).render('index')
        } else {
            res.send('Invalid! login details')
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

app.listen(port, () => {
    console.log(`server listen at the port ${port}`);
})



/*
const bcrypt = require('bcryptjs')

const securePassword = async (pass) =>{
    
    const passwordHash = await bcrypt.hash(pass, 10)
    console.log(passwordHash);
    
    const passwordMatch = await bcrypt.compare(pass, passwordHash)
    console.log(passwordMatch);
    
}

securePassword("12345")

const jwt = require('jsonwebtoken')

const createToken = async () => {

    // token generate
    const token = await jwt.sign({_id:'632613929a974eadc26e58c1'},"mynameismuhammaddaniyalsaleemfullstackdeveloper")
    console.log(token);
    
    // varify user authenticate hy ya nhi
    const tokenVerify = await jwt.verify(token,"mynameismuhammaddaniyalsaleemfullstackdeveloper")
    console.log(tokenVerify);
}

createToken()
*/