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
        const userCollection = client.db('finalData').collection('user');
        const orderCollection = client.db('finalData').collection('order');
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'your access is forbidden(403)' });
            }
        }
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
        //----------------- POST Oparation for single products --------------------//
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })
        //----------------- DELETE oparation for single products --------------------//
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })
        //----------------- POST Oparation for Review --------------------//
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })
        //----------------- GET Oparation to load reviews --------------------//
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        //----------------- POST Oparation for User Info --------------------//
        app.post('/user', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })
        //----------------- GET oparation for user --------------------//
        app.get('/user', jwtVerifiction, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = userCollection.find(query);
                const user = await cursor.toArray();
                res.send(user);
            }
            else {
                res.status(403).send({ message: 'your access is forbidden-(403)' })
            }
        })
        //----------------- POST Oparation for Order --------------------//
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        })

        app.get('/order', jwtVerifiction, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const order = await cursor.toArray();
                res.send(order);
            }
            else {
                res.status(403).send({ message: 'your access is forbidden-(403)' })
            }
        })
        //----------------- GET Oparation for Admin --------------------//
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })
        //----------------- GET Oparation for All user --------------------//
        app.get('/alluser', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })
        //----------------- Put Oparation for Admin --------------------//
        app.put('/alluser/admin/:email', jwtVerifiction, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
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