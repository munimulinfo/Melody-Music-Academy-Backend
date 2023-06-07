const express = require("express");
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId,} = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
app.use(cors());
const port = process.env.PORT | 5000;
app.use(express.json())

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}


// mongo db connections
const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.j5a0pdi.mongodb.net/?retryWrites=true&w=majority`;
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

    const usersCollection = client.db("music-instruments-learn-school").collection('users');
    // allusers get api 
     app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray();
     res.send(result);
     })

  //alluser data post api 
     app.post('/users', async(req, res) => {
     const user = req.body;
     const query = { email: user.email };
     const existingUser = await usersCollection.findOne(query);
     if (existingUser) {
       return res.send({ error: "user Alredy exsits" })
     }
     const result = await usersCollection.insertOne(user);
     res.send(result);
  });


  // app.get('/users/admin/:email', verifyJWT, async (req, res) => {
  //   const email = req.params.email;

  //   if (req.decoded.email !== email) {
  //     res.send({ admin: false })
  //   }

  //   const query = { email: email }
  //   const user = await usersCollection.findOne(query);
  //   const result = { admin: user?.role === 'admin' }
  //   res.send(result);
  // })

// user role update this api
  app.patch('/users/admin/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: 'admin'
      },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
  });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("music instrument leran school server is running");
  })
  
  app.listen(port, (req, res) => {
    console.log(`music instrument leran school server is running on port ${port}`)
  })