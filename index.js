const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ev4byy.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    // console.log('inside token', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try{
        const userInformationCollection = client.db('ph-hero-user-table').collection('user-details')
        const billingCollection = client.db('ph-hero-user-table').collection('billing-collection')

        // jwt*****************************
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email}
            const user = await userInformationCollection.findOne(query);
            // console.log(user)

            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '70h' })
                return res.send({accessToken: token})
            }

            res.status(403).send({token: ''})
        })

        // login user************************
        app.get('/login', async (req, res) => {
            const email = req.query.email;
            const password = req.query.password;
            const query = {email: email, password: password};
            const user = await userInformationCollection.findOne(query)      
            res.send(user)
          })

        app.get('/loginEmail', async (req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await userInformationCollection.findOne(query)      
            res.send(user)
          })

          app.post('/registration', async(req, res)=>{
            const user = req.body;
            const result = await userInformationCollection.insertOne(user)
            res.send(result)
          })


          // billing Collection
          app.get('/billing-list', verifyJWT, async(req, res)=>{
            const query = {};
            const decodedEmail = req.decoded.email;
            // if(email !=decodedEmail){
            //     return res.status(403).send({message: 'forbidden access'})
            // }

            const cursor = billingCollection.find(query)
            const billingList = await cursor.toArray();
            const count = await billingCollection.estimatedDocumentCount()

            res.send({count, billingList})
        })

    }

    finally{

    }
}




app.get('/', async(req, res) =>{
    res.send('user table server is running')
})

app.listen(port, () => console.log(`user table running on port ${port}`))

run().catch(console.dir);