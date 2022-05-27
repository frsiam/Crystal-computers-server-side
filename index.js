const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()

// middleware 
app.use(cors())
app.use(express.json())

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ meassase: 'Unauthorized Access' })
    }
    const myToken = authHeader.split(' ')[1];
    jwt.verify(myToken, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zxp0r.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("crystal_computers").collection("parts");
        const orderCollection = client.db("crystal_computers").collection("orders");
        const userCollection = client.db("crystal_computers").collection("users");
        const reviewCollection = client.db("crystal_computers").collection("reviews");

        // users information creat a collection
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.SECRET_TOKEN, { expiresIn: '1h' })
            res.send({ result, token });
        })

        // add an admin role on same api where we post the user information 
        app.put('/user/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const filter = { email: requester };
            const requesterAccount = await userCollection.findOne(filter)
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' }
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Unauthorized access !' })
            }
        })

        //check the logged in user admin or not
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const user = await userCollection.findOne(filter)
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin });
        })

        // get all user from this api 
        app.get('/user', verifyToken, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        // add a product/parts
        app.post('/addproduct', async (req, res) => {
            const newProduct = req.body;
            const result = await partsCollection.insertOne(newProduct);
            res.send(result);
        })
        // load all parts from database
        app.get('/parts', async (req, res) => {
            const query = {};
            const parts = await partsCollection.find().toArray()
            res.send(parts);
        })

        // load single parts from database by id 
        app.get('/part/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        })
        //update parts quantity
        app.put('/part/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updatedQuantity,
            };
            const result = await partsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        // Get all My orders api
        app.get('/myorder', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email };
                const myOrders = await orderCollection.find(query).toArray();
                res.send(myOrders);
            }
            else {
                return res.status(403).send({ meassase: 'forbidden access' });
            }
        })
        //post a order from client side or create an order
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        //Delete a order from client
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })
        // Post a review from client side to database
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        // Get all reviews
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews);
        })
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/siam', (req, res) => {
    res.send('Asignment 12 is on fire')
})
app.get('/', (req, res) => {
    res.send('Insha allah one day muslimes rolling the whole world')
})

app.listen(port, () => {
    console.log(`Crystal computer listening on port ${port}`)
})