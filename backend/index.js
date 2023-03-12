/*
  dependencies
*/

const express = require('express')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccount.json')

/*
  config-express
*/

const app = express()


/*
  config - firebase
 */

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

/*
  endpoint - posts
*/

app.get('/posts', async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*")
  let posts = []
  const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
  snapshot.forEach((doc) => {
    posts.push(doc.data());
  });


  response.send(posts)
})

/*
  endpoint - create post
*/

app.get('/createPost', async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*")

  response.send("create post")
})


/*
  listen
*/

app.listen(3000, () => console.log("App Running"))
