import { Client, Databases } from 'appwrite';

let client = null;
let databases = null;

export function initAppwrite() {
  client = new Client();
  // Appwrite endpoint and project ID configured
  client.setEndpoint('https://fra.cloud.appwrite.io/v1').setProject('693f1ea5002f0c20c826');
  databases = new Databases(client);
}

export function getDatabases() {
  if (!databases) initAppwrite();
  return databases;
}

export function getClient() {
  if (!client) initAppwrite();
  return client;
}

// If you deploy the `link-google` Appwrite Function, put its execution URL here.
// Example: 'https://fra.cloud.appwrite.io/v1/functions/xxxxx/executions'
export const LINK_GOOGLE_FUNCTION_URL = 'https://fra.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions';

export async function createOAuthSession(provider, successUrl, failureUrl){
  // Example: client.account.createOAuth2Session('google', successUrl, failureUrl)
  const account = require('appwrite').Account;
  // This is left as a placeholder — Appwrite OAuth flow from mobile may require web redirects.
  throw new Error('createOAuthSession not implemented. Configure OAuth redirect on Appwrite console and use web flow or a custom server.');
}
