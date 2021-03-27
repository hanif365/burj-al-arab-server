const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

require('dotenv').config()


const port = 5000

const app = express()

app.use(cors());
app.use(bodyParser.json());

// var serviceAccount = require("./burj-al-arab-365-firebase-adminsdk-udewa-d58f8c5319.json");
const serviceAccount = require("./configs/burj-al-arab-365-firebase-adminsdk-udewa-d58f8c5319.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwfp8.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // console.log('DB connected successfully');

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        // console.log(result);
        res.send(result.insertedCount > 0);
      })
    console.log({newBooking});
  })

  app.get('/bookings', (req, res) => {
    // console.log(req.query.email);
    console.log(req.headers.authorization);

    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({ idToken });

      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          // const uid = decodedToken.uid;
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail , queryEmail)
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.send(documents);
              })
          }
          console.log({ uid });
        })
        .catch((error) => {
         
        });
    }
    else{
      res.status(401).send('Unauthorized access')
    }



  })


  // client.close();
});


app.get('/', (req, res) => {
  res.send('Hello react!!')
})

app.listen(port)