import express, { Request, Response } from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
const avd = require("all-video-downloader");


// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create an instance of Express
const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req: Request, res: Response) => {
  const { videoLongLink, expirationDate } = req.body;

  try {
    // Generate a unique ID for the link
    const uniqueId = uuidv4().split('-')[0];

    // Store the link and expiration time in Firestore
    await admin.firestore().collection('links').doc(uniqueId).set({
      videoLongLink,
      id: uniqueId,
      videoShortLink: `http://localhost:3000/${uniqueId}`,
      expirationDate,
    });

    // Return the generated short link
    res.status(200).json({ videoShortLink: `http://localhost:3000/${uniqueId}` });
  } catch (error) {
    console.error('Error generating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/download', async (req: Request, res: Response) => {
  const videoURL = req.query.URL?.toString();

  avd(
    videoURL
  ).then((result: any) => {
    res.status(200).json({ data: result.links[0] })
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
