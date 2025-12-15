Appwrite Function: link-google

Purpose:
- Verify Google ID token (issued by mobile OAuth) and create or retrieve a `user` document in Appwrite database.

Env vars required when deploying to Appwrite Functions:
- `GOOGLE_CLIENT_ID` - your Google OAuth client ID
 - `GOOGLE_CLIENT_ID` - your Google OAuth client ID (example from your file: `635500458464-ulf5cjmelgosv3dj3j80fcrl184mkvqc.apps.googleusercontent.com`)
- `APPWRITE_ENDPOINT` - e.g. https://[HOSTNAME]/v1
- `APPWRITE_PROJECT` - Appwrite project id
- `APPWRITE_KEY` - Appwrite API key with permissions to create documents
- `DATABASE_ID` - Appwrite database id
- `USERS_COLLECTION_ID` - collection id for `users`

Usage:
- Deploy this function in Appwrite (nodejs runtime).
- From mobile app after obtaining Google ID token, call the function endpoint with POST { idToken }
- The function will verify the token and return the user document.

Security:
- Keep `APPWRITE_KEY` secret. Use function environment variables in Appwrite console.
- Consider creating proper permissions and rules for the `users` collection.
