const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ztluf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const billingCollection = client.db("database").collection("billings");

        // get billing
        app.get('/api/billing-list', async (req, res) => {
            const billing = await billingCollection.find().toArray()
            res.send(billing)
        })

        // post billing
        app.post('/api/add-billing', async (req, res) => {
            const billing = req.body;
            const result = await billingCollection.insertOne(billing);
            res.send(result)
        })

    }
    catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Power Hack is listening on port ${port}`)
})