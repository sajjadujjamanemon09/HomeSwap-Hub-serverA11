const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(
  cors({
    origin: [
      // "http://localhost:5173",
      "https://assignment-11-abaf2.web.app",
      "https://assignment-11-abaf2.firebaseapp.com",
    ],
    credentials: true,
  })
);
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

// middlewares
const logger = (req, res, next) => {
  console.log("log: info", req.method, req.url);
  next();
};

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // connect collection
    const serviceCollection = client.db("homeSwapDB").collection("services");
    const userServiceCollection = client.db("homeSwapDB").collection("userServices");
    const bookingCollection = client.db("homeSwapDB").collection("bookings");

    // auth related api
    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("logging out", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    // service Collection
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // create service Collection post
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await serviceCollection.insertOne(services);
      res.send(result);
    });

    //  service collection get
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    // userService Collection
    app.get("/userServices", async (req, res) => {
      const cursor = userServiceCollection.find();
      const result = await cursor.toArray();

      res.send(result);
    });

    // create userService Collection post
    app.post("/userServices", async (req, res) => {
      const services = req.body;
      const result = await userServiceCollection.insertOne(services);
      res.send(result);
    });

    //  get user service collection
    app.get("/userServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userServiceCollection.findOne(query);
      res.send(result);
    });

    // specific user collection to the add service My service page
    app.get('/userIdServices',  async (req, res) => {
          query = { email: req.query?.email }
      console.log("query", req.query);
      const result = await userServiceCollection.find(query).toArray();
      res.send(result);
    })

    // userService secure
    app.get("/userServices", logger, verifyToken, async (req, res) => {
      console.log(req.query.email);
      console.log("token owner info", req.user);
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await userServiceCollection.find(query).toArray();
      res.send(result);
    });
    // userService update
    app.put("/userServices/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const userServiceData = req.body;
      const bookings = {
        $set: {
          userName: userServiceData.userName,
          serviceName: userServiceData.serviceName,
          email: userServiceData.email,
          price: userServiceData.price,
          description: userServiceData.description,
          image: userServiceData.image,
          area: userServiceData.area,
        },
      };
      const result = await userServiceCollection.updateOne(
        filter,
        bookings,
        options
      );
      res.send(result);
    });

    // user Service delete method
    app.delete("/userServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userServiceCollection.deleteOne(query);
      res.send(result);
    });

    // booking Collection post
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    });
    // booking Collection get
    app.get("/bookings", async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // bookings collection secure
    app.get("/bookings", logger, verifyToken, async (req, res) => {
      console.log(req.query.email);
      console.log("token owner info", req.user);
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // booking delete method
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
