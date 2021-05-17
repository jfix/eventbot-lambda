import { JWT } from 'google-auth-library';

let jwt;

module.exports.googleAuth = () => {
    try {
        jwt = new JWT({
            // keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE,
            email: process.env.EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_EMAIL,
            key: process.env.EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_KEY.replace(/\\n/gm, '\n'),
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        // console.log(`AUTH: ${JSON.stringify(jwt)}`)
        return jwt;
    } catch (error) {
        console.log(`AUTH: ${error}`)
    }
};
