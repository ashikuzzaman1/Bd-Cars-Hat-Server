const express = require('express');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send('Server Is Ready');
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.6k3we.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db("carhat");
    const carCollection = database.collection("car");
    const cartCollection = database.collection("cart");
    const reviewCollection = database.collection("review");
    app.get('/car', async (req, res)=>{
        const cursor = carCollection.find({});
        const car = await cursor.toArray();
        res.json(car);
    });

    app.get('/review', async(req, res) =>{
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
  })


    //load all cart data using user id
    app.get("/cart/:uid", async(req, res)=>{
      const uid = req.params.uid;
      const query = { uid: uid};
      const result = await cartCollection.find(query).toArray();
      res.json(result);
    });

    //add data to cart collection with additional info
    app.post("/car/add", async(req, res)=>{
      const car = req.body;
      const result = await cartCollection.insertOne(car);
      console.log(result.insertedId);
      res.json(result);
    });

    //delete data from cart
    app.delete("/delete/:id", async (req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.json(result);
    });

    //purchase delete api
    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = {uid: uid};
      const result = await cartCollection.deleteMany(query);
      res.json(result);
    });

    //load admin all order
    app.get("/orders", async (req, res) =>{
      const result = await cartCollection.find({}).toArray();
      res.json(result);
    })

    // post api add a car data
      app.post('/car', async(req, res) =>{
      const ca = req.body;
      console.log('hits', ca);
      const result = await carCollection.insertOne(ca);
      console.log(result);
      res.json(result);
      });

    // post api add a review data
      app.post('/review', async(req, res) =>{
      const view = req.body;
      console.log('hits', view);
      const result = await reviewCollection.insertOne(view);
      console.log(result);
      res.json(result);
      });

  } finally {
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log('Server Is Ready On Port',port)
})