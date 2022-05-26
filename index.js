const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const port = process.env.PORT || 4000
const cors = require('cors')
require('dotenv').config()

// middleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zxp0r.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("crystal_computers").collection("parts");
        const orderCollection = client.db("crystal_computers").collection("orders");
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
        //post a order from client side or create an order
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
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
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Crystal computer listening on port ${port}`)
})