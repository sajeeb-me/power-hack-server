const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let billing;
            if (page || size) {
                billing = (await billingCollection.find().skip(page * size).limit(size).toArray()).reverse();
            }
            else {
                billing = (await billingCollection.find().toArray()).reverse();
            }
            res.send({ success: true, data: billing })
        })
        app.get('/api/billing-count', async (req, res) => {
            const totalBill = await billingCollection.estimatedDocumentCount()
            res.send({ totalBill })
        })
        app.get('/api/billing-list/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const billing = await billingCollection.findOne(query)
            res.send(billing)
        })

        // post billing
        app.post('/api/add-billing', async (req, res) => {
            const billing = req.body;
            if (!billing.email || !billing.amount) {
                return res.send({ success: false, error: 'Please provide all information' })
            }
            const result = await billingCollection.insertOne(billing);
            res.send({ success: true, message: `Successfully added new bill` })
        })

        // patch billing
        app.patch('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            if (!id) {
                return res.send({ success: false, error: 'Id is not provided' })
            }
            const billing = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: billing
            };
            const result = await billingCollection.updateOne(filter, updateDoc);
            res.send({ success: true, message: result })
        })

        // delete
        app.delete('/api/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            if (!id) {
                return res.send({ success: false, error: 'Id is not provided' })
            }
            const filter = { _id: ObjectId(id) };
            const result = await billingCollection.deleteOne(filter);
            res.send({ success: true, message: 'Bill deleted' })
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