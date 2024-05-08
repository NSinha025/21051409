const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

const port = 3000;


const windowSize = 10;
let numbers = [];

const fetchNumbers = async () => {
    try {
        const authToken = process.env.ACCESS_TOKEN;
        const response = await axios.get('http://20.244.56.144/test/even', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        return response.data.numbers || [];
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
};


app.get('/numbers/:numberId', async(req, res) => {
    const { numberId } = req.params;
    let numbersFiltered;

    const number = await fetchNumbers();

    res.json(number);
});







app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});