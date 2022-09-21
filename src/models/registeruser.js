const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{ // rule hy issi trhn likhta hen
        token: {
            type: String,
            required: true
        }
    }]
})

// generate token
registerSchema.methods.generateAuthToken = async function () {
    try {
        // toString - objectId convert into string - id ki value as a object ma hoti isilya
        // console.log(this._id.toString());
        const generateToken = await jwt.sign({ _id: this._id.toString()}, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token: generateToken});  // tokens ki field ma token ky object ma genearated token dalrhy 
        await this.save(); // apna token ki filed ma tokenValue daldi to database ma save krana kalya call kra this.save or promise return krta hy, or token ki value yehe save krwani pregi call ki jgah py koe tareeka nh save krna ka
        return generateToken;
    } catch (error) {
        res.send(`the error part ${error}`)
        console.log(`the error part ${error}`)
    }
}

// this.password -> means currect form password field ma jo value dali hy
// data get krna ka bad or database ma save krna sy pehla yeh hashing hogi middleware ma
registerSchema.pre("save", async function (next) {
    if (this.isModified('password')) { // password jb update or firsttime hoga jbhi run ho
        // console.log(`the password of the user is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10)
        this.confirmpassword =  await bcrypt.hash(this.password, 10);
    }
    next() // next hash krna ka bd kya krna woh hmna save event btadeya yeh krna hy
})

const User = mongoose.model('User', registerSchema)

module.exports = User;