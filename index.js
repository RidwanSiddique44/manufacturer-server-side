require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

//----------------- JWT varification function --------------------//
function jwtVerifiction(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'your access is unauthorized-(401)' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'your access is forbidden-(403)' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0clw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('finalData').collection('products');
        const reviewCollection = client.db('finalData').collection('reviews');
        //----------------- POST Oparation for token access --------------------//
        app.post('/signin', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken });

        })
        //----------------- GET Oparation to load products --------------------//
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
        //------------- GET Oparation to load single products------------------//
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        //----------------- POST Oparation for Review --------------------//
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })


    }
    finally {
        //All Operation Done
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from final project')
})

app.listen(port, () => {
    console.log(`Final project listening on port ${port}`)
})