const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');
dotenv.config();
const ObjectId = require('mongodb').ObjectId;

const ConnectionURL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 3000;
const dbname = process.env.DB_NAME;
let db;

app.use(express.json()); // Middleware to parse JSON bodies

(async function(){
   try {
    const client = await MongoClient.connect(ConnectionURL);
    db = client.db(dbname);
    console.log('Connected to database');
   } catch (err) {
    console.error('Failed to connect to the database', err);
    process.exit(1);
   }
})();

app.get('/', async (req, res) => {
    try {
        const result = await db.collection('products').find().toArray();
        res.send(result);
    } catch (err) {
        console.error('Error fetching products', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/product', async (req, res) => {
    try {
        const product = req.body;
        if (!product.name || !product.price || !product.rating) {
            return res.status(400).send('Bad Request: Missing required fields');
        }
        const result = await db.collection('products').insertOne(product);
        res.status(201).send(result.ops[0]); // Send the inserted document back as the response
    } catch (err) {
        console.error('Error inserting product', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
