const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000


// middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hepooac.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    // connect collection
    const serviceCollection = client.db('homeSwapDB').collection('services')
    const bookingCollection = client.db('homeSwapDB').collection('bookings')
    const addingCollection = client.db('homeSwapDB').collection('addProducts')


    // service Collection
    app.get('/api/v1/services', async (req, res) => {
      const cursor = serviceCollection.find()
      const result = await cursor.toArray()
    
      res.send(result)
    })

    // booking Collection
    app.post('/api/v1/user/create-booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })


    
    // get adding collection
    app.get('/api/v1/user/addProducts', async (req, res) => {
      const cursor = addingCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    // adding Collection
    app.post('/api/v1/user/addProducts', async (req, res) => {
      const addProducts = req.body;
      const result = await addingCollection.insertOne(addProducts)
      res.send(result)
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







// server connection for all project
app.get('/', (req, res) => {
    res.send('setUp server running')
})
app.listen(port, () => {
    console.log(`setUp project server running on PORT: ${port}`);
})