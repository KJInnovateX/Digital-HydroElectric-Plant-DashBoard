const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const http  = require('http');
const qs = require('querystring');
const app = express();
const cron = require('node-cron');
const PDFDocument = require('pdfkit');
const moment = require('moment-timezone');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Replace these with your actual database credentials
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sihreport'
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Middleware to parse POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// Endpoint to handle data insertion
app.post('/insertData', (req, res) => {
    // Retrieve data from the POST request
    const {
        metric1Value,
        metric2Value,
        metric3Value,
        metric4Value,
        randomNumber,
        rpm,
        powerGenerated,
        totalPowerGenerated,
        waterpre
    } = req.body;
    console.log(req.body);
    
    var date_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
console.log(date_time);
    const sql = 'INSERT INTO report (waterlevel,inflowwater,outflowwater,temperature,humidityrange,turbineRPM,powergenerate,totalpowergenerated,waterpressure,time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    // Use the pool to execute the query
    pool.query(sql, [metric1Value, metric2Value, metric3Value, metric4Value, randomNumber, rpm, powerGenerated, totalPowerGenerated,waterpre,date_time], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Error inserting data');
        } else {
            console.log('Data inserted successfully.');
            res.status(200).send('Data inserted successfully');
        }
    });
});

// Add a new endpoint to handle data retrieval
app.get('/getData', (req, res) => {
    const sql = 'SELECT * FROM report'; // Modify the query as needed

    // Use the pool to execute the query
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Error retrieving data');
        } else {
            // Send the data as JSON
            res.status(200).json(results);
        }
    });
});

//chart 

app.get('/waterData', (req, res) => {
    const query = 'SELECT time, inflowwater, outflowwater FROM report ORDER BY time DESC LIMIT 10';
  
    pool.query(query, (error, results) => {
      if (error) throw error;
  
      res.json(results);
    });
  });


// Start the server
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
