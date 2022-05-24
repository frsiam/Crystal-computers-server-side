const { MongoClient, ServerApiVersion } = require('mongodb');
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
        app.get('/parts', async (req, res) => {
            const query = {};
            const parts = await partsCollection.find().toArray()
            res.send(parts);
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