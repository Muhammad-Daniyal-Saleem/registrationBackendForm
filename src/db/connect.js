const mongoose = require('mongoose')

mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`)
.then(()=> console.log('connection successfull..'))
.catch((err)=> console.log(err))