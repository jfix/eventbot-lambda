import * as dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const googleClient = new google.auth.GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/calendar']
});

module.exports = { 
    googleAuth:  googleClient
};
