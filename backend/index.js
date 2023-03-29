/*
  dependencies
*/

const express = require('express')
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const os = require('os');
const fs = require('fs');
const uuid = require('uuid-v4');

const serviceAccount = require('./serviceAccount.json')

let busboy = require('busboy');

/*
  config-express
*/

const app = express()


/*
  config - firebase
 */



initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'gs://quasagram-438eb.appspot.com'
});

const db = getFirestore();
const bucket = getStorage().bucket();

/*
  endpoint - posts
*/


app.get('/posts', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  let posts = []
  const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
  snapshot.forEach((doc) => {
    posts.push(doc.data());
  });


  res.send(posts)
})

/*
  endpoint - create post
*/

app.post('/createPost', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")

  const bb = busboy({ headers: req.headers });
  let tokenId = uuid()
  let fields = {}
  let fileData = {}
  bb.on('file', (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    console.log(
      `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType
    );



    // /tmp/234235-123324.png`
    let filePath = path.join(os.tmpdir(), filename)
    file.pipe(fs.createWriteStream(filePath))
    fileData = { filePath, mimeType }
  });
  bb.on('field', (name, val, info) => {
    console.log(`Field [${name}]: value: %j`, val);
    fields[name] = val
  });
  bb.on('close', () => {
    bucket.upload(
      fileData.filePath,
      {
        uploadType: 'media',
        metadata: {
          contentType: fileData.mimeType,
          firebaseStorageDownloadTokens: tokenId
        },
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile);
        }
      }
    )

    function createDocument(uploadedFile) {
      db.collection('posts').doc(fields.id).set({
        id: fields.id,
        caption: fields.caption,
        location: fields.location,
        date: parseInt(fields.date),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${ uploadedFile.name }?alt=media&token=${tokenId}`
      }).then(() => {
        res.send('Post aded: ' + fields.id)
      })
    }
  });
  req.pipe(bb);
})


/*
  listen
*/

app.listen(process.env.PORT || 3000)
