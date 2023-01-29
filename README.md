##Server-
npm init -y
npm i express cors dotenv mongodb


npm install jsonwebtoken
 require('crypto').randomBytes(64).toString('hex')


>>> index.js>>>>>>
const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', async(req, res) =>{
    res.send('user table server is running')
})

app.listen(port, () => console.log(`user table running on port ${port}`))