//const axios =require('axios');
import axios from 'axios'
import cheerio from 'cheerio'
import express from 'express'
import {MongoClient} from "mongodb"
import cors from "cors"
import dotenv from "dotenv"
//const cheerio = require('cheerio');
 //const express=require('express')
 
 //const client =await createConnection();

 const url="mongodb+srv://ajitha:ajitha29@cluster0.w5zik5e.mongodb.net/?retryWrites=true&w=majority"
 const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
 dotenv.config();
 const app = express();
 app.use(cors());
app.use(express.json());
const PORT=process.env.PORT;
// Base URL of the Flipkart search results page
app.get('/scrape', async (req, res) => {
const baseUrl = 'https://www.flipkart.com/search?q=';

// Search queries for different pages
const searchQueries = ['laptops', 'mobiles','macbook','iphone','samsung 5G mobile','smart Tv','iphone 14 pro max']; // Example queries

// Function to scrape a single page
async function scrapePage(query) {
  try {
    const url = baseUrl + query;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
//._1fQZEK
// camera .s1Q9rs
    const productNames = [];
    
    
    $('._1fQZEK').each((index, element) => {
        const title = $(element).find('._4rR01T').text().trim();
        const price = $(element).find(' ._3tbKJL ._30jeq3._1_WHN1').text().trim();
        const ratingandreviews = $(element).find('._2_R_DZ ').text().trim();
        const image =$(element).find('img').attr('src');
      productNames.push({title,price,image,ratingandreviews});
    });

    return productNames;
    
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Function to scrape multiple pages
async function scrapeAllPages() {
  const allProductNames = [];
  // Connect to MongoDB Atlas
  await client.connect();
  const db = client.db('webscrape');
  const collection = db.collection('flipkartdata');
  for (const query of searchQueries) {
    const productNames = await scrapePage(query);
    allProductNames.push(...productNames);
    console.log(`Scraped ${productNames.length} products for query: ${query}`);
  }
  // Insert the scraped data into MongoDB Atlas
  const result = await collection.insertMany(allProductNames);
  console.log(`${result.insertedCount} documents were inserted`);
  res.json({ allProductNames });
  // Print all scraped product names
  console.log('All scraped product names:', allProductNames);
  
    // Close the connection
    await client.close();
  
}

// Start scraping
scrapeAllPages();
});
app.listen(PORT, ()=>console.log("server running in localhost:1080")) 