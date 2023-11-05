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

    app.get('/api/v1/services', async (rew, res) => {
      const cursor = serviceCollection.find()
      const result = await cursor.toArray()
    
      res.send(result)
    })
    app.post('/api/v1/user/create-booking', (req, res) => {
      req.body;
      // res.send()
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