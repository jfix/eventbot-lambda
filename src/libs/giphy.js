require('dotenv').config({ path: '../.env'});
const giphy = require('giphy-api')(process.env.GIPHY_APIKEY);


const randomBirthdayImage = async () => {
    try {
        const res = await giphy.random('birthday')
        // use a URL from the Giphy result JSON that is known to be smaller than 2MB
        // and replace subdomain with image-only subdomain 'i'
        const url = res.data.images.downsized.url.replace(/https:\/\/[^.]+/, 'https://i')
        return url
    } catch (e) {
        throw Error(`Giphy error: ${e}`)
    }
}

module.exports = {
    image: randomBirthdayImage
}
