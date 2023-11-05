const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

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
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    
    // connect collection
    const serviceCollection = client.db("homeSwapDB").collection("services");
    // const bookingCollection = client.db('homeSwapDB').collection('bookings')

    // service Collection
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });
    
    // create service Collection
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await serviceCollection.insertOne(services);
      res.send(result);
    });


    
    // update service collection
    app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await serviceCollection.findOne(query);
      res.send(result);
  });
  app.put("/services/:id", async(req, res) =>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const options = { upsert: true };
    const updatedServices = req.body;
      const service = {
        $set: {
          userName:updatedServices.userName, 
          serviceName:updatedServices.serviceName, 
          email:updatedServices.email, 
          price:updatedServices.price, 
          description:updatedServices.description, 
          image:updatedServices.image, 
          area:updatedServices.area
        }
      }
      const result = await serviceCollection.updateOne(filter, options, service)
      res.send(result)
    })



    //   // booking Collection add
    //   app.post('/api/v1/user/booking', async (req, res) => {
    //     const booking = req.body;
    //     const result = await bookingCollection.insertOne(booking)
    //     res.send(result)
    //   })
    //   // booking collection delete
    //   app.delete('/api/v1/user/cancelBooking/:bookingId', async (req, res) => {
    //     const id = req.params.bookingId
    //     const query = { _id: new ObjectId(id) }
    //     const result = await bookingCollection.deleteOne(query)

    //     res.send(result)

    // })











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server connection for all project
app.get("/", (req, res) => {
  res.send("setUp server running");
});
app.listen(port, () => {
  console.log(`setUp project server running on PORT: ${port}`);
});
