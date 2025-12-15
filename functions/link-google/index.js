const { OAuth2Client } = require('google-auth-library');
const Appwrite = require('node-appwrite');

// Expected environment variables:
// - GOOGLE_CLIENT_ID
// - APPWRITE_ENDPOINT
// - APPWRITE_PROJECT
// - APPWRITE_KEY
// - DATABASE_ID
// - USERS_COLLECTION_ID

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async function (req, res) {
  try {
    const body = req.body || {};
    const idToken = body.idToken;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Initialize Appwrite client (use API key with admin privileges)
    const client = new Appwrite.Client();
    client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT).setKey(process.env.APPWRITE_KEY);
    const database = new Appwrite.Databases(client);

    // Check if user document exists
    const databaseId = process.env.DATABASE_ID;
    const collectionId = process.env.USERS_COLLECTION_ID;

    // Try to find by email -- Appwrite doesn't have direct query in JS SDK v10; use listDocuments with filters
    const existing = await database.listDocuments(databaseId, collectionId, [
      `email=${email}`
    ]);

    if (existing.total > 0) {
      // return existing
      return res.status(200).json({ ok: true, user: existing.documents[0] });
    }

    // create new user document
    const doc = await database.createDocument(databaseId, collectionId, Appwrite.ID.unique(), { email, name, picture });

    return res.status(201).json({ ok: true, user: doc });
  } catch (err) {
    console.error('link-google error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
