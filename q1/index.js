const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

const windowSize = 10;
let numbers = [];

const fetchNumbers = async () => {
    try {
        const authToken = process.env.ACCESS_TOKEN;
        const response = await axios.get('http://20.244.56.144/test/rand', {
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

const isPrime = num => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const isFibonacci = num => {
    const fib = [];
    let a = 0, b = 1;
    while (b < num) {
        fib.push(b);
        [a, b] = [b, a + b];
    }
    return fib.includes(num);
};


const updateNumbers = async () => {
    const fetchedNumbers = await fetchNumbers();
    numbers.push(...fetchedNumbers.filter(num => !numbers.includes(num)));
    if (numbers.length > windowSize) {
        numbers = numbers.slice(-windowSize);
    }
};

const calculateAverage = () => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return numbers.length ? (sum / numbers.length).toFixed(2) : '0.00';
};

app.use(async (req, res, next) => {
    await updateNumbers();
    next();
});


app.get('/numbers/:numberId', (req, res) => {
    const { numberId } = req.params;
    let numbersFiltered;

    switch (numberId) {
        case 'p':
            numbersFiltered = numbers.filter(isPrime);
            break;
        case 'f':
            numbersFiltered = numbers.filter(isFibonacci);
            break;
        case 'e':
            numbersFiltered = numbers.filter(num => num % 2 === 0);
            break;
        case 'r':
            numbersFiltered = numbers;
            break;
        default:
            return res.status(400).json({ error: 'Invalid number ID' });
    }

    const average = calculateAverage();
    const response = {
        numbers: numbersFiltered,
        windowPrevState: numbers.slice(0, numbers.length - numbersFiltered.length),
        windowCurrState: numbers.slice(numbers.length - numbersFiltered.length),
        avg: average
    };

    res.json(response);
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});