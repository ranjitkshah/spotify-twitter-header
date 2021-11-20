const cron = require('node-cron');
require("dotenv").config();
const express = require('express');
const fs = require('fs');
const Jimp = require('jimp');
const { getRequest , postRequest } = require('./requestPromise');
const client = require('twitter-api-client');


const twitterClient = new client.TwitterClient({
    apiKey: process.env.TWITTER_API_KEY, //YOUR CONSUMER API KEY
    apiSecret: process.env.TWITTER_API_SECRET, //YOUR CONSUMER API SECRET
    accessToken: process.env.TWITTER_ACCESS_TOKEN, //YOUR ACCESS TOKEN
    accessTokenSecret: process.env.TWITTER_ACCESS_SECRET, //YOUR ACCESS TOKEN SECRET
  });




// cron job to run every day at 12:00 AM
cron.schedule('0 0 * * *', async () => {
    console.log('running a task every day at 12:00 AM');

});



// to get the spotify top tracks
const spotifyTopList = async () => {
    // top tracks array;
    const topTracks = [];
    const access_token = await spotifyRefreshToken();
    const options = {
        url: 'https://api.spotify.com/v1/me/top/tracks',
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };
    
      const res = await getRequest(options);
      res.items.forEach(track => {
        topTracks.push(track.name);
      });
    return topTracks;
}

// to get the spotify refresh token
const spotifyRefreshToken = async () => {
    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        headers: {
            Authorization:
            "Basic " +
            Buffer.from(
                process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
                ).toString("base64"),
            },
            form: {
                grant_type: "refresh_token",
                refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
            },
            json: true,
        };
        
      const res = await postRequest(authOptions); 
      return res.access_token;
}
    
spotifyTopList().then(res => {
    writeOnImage(res);
});





// Function to write on image (Top played songs)
const writeOnImage = async (songsName = []) => {
    const path = './uploadedImage.png';
    try {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    } catch (err) {
      console.log('No file exits');
    }
  
    Jimp.read('spotifyTop5.png')
      .then(function (image) {
        loadedImage = image;
        return Jimp.loadFont('Poppins-ExtraBold.ttf.fnt');
      })
      .then(function (font) {
        loadedImage.print(font, 900, 120, `${songsName[0]}`);
        loadedImage.print(font, 900, 170, `${songsName[1]}`);
        loadedImage.print(font, 900, 220, `${songsName[2]}`);
        loadedImage.print(font, 900, 270, `${songsName[3]}`);
        loadedImage.print(font, 900, 320, `${songsName[4]}`);
  
        // Save image and upload on twitter
        loadedImage.write(path, async function () {
            try {
                const base64 = await fs.readFileSync(path, { encoding: 'base64' });
                // Update the banner
                await twitterClient.accountsAndUsers.accountUpdateProfileBanner({
                  banner: base64,
                });          
                console.log('Image updated');
        
            } catch (err) {
                console.log(err);
            }
        });
      })
      .catch(async function (err) {
        console.error(err);
      });
  };