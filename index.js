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
    const bookingCollection = client.db("homeSwapDB").collection("bookings");

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

    //  service collection
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });


    // booking Collection add
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

     // update booking collection
     app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const bookingData = req.body;
      const bookings = {
        $set: {
          userName: bookingData.userName,
          serviceName: bookingData.serviceName,
          email: bookingData.email,
          price: bookingData.price,
          description: bookingData.description,
          image: bookingData.image,
          area: bookingData.area,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        bookings,
        options
      );
      res.send(result);
    });
        // delete method
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });
   
    // -------------------------------------------------------------------

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
