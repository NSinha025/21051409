const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;
const testServerUrl = 'http://20.244.56.144';


const productCache = {};

const fetchProducts = async (companyName, categoryName, top, minPrice, maxPrice) => {
    try {
        const authToken = process.env.ACCESS_TOKEN;
        const response = await axios.get(`${testServerUrl}/test/companies/${companyName}/categories/${categoryName}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        return response.data.products || [];
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return [];
    }
};

app.get('/products/companies/:companyName/categories/:categoryName/products', async (req, res) => {
    const { companyName, categoryName } = req.params;
    const { top, minPrice, maxPrice } = req.query;

    const cacheKey = `${companyName}-${categoryName}-${top}-${minPrice}-${maxPrice}`;
    if (productCache[cacheKey]) {
        return res.json(productCache[cacheKey]);
    }

    const products = await fetchProducts(companyName, categoryName, top, minPrice, maxPrice);

    productCache[cacheKey] = products;

    res.json(products);
});

app.get('/categories/:categoryName/products/:productId', async (req, res) => {
    const { categoryName, productId } = req.params;

    const cacheKey = `${categoryName}-details`;
    const productDetails = productCache[cacheKey] || {};

    const product = productDetails[productId];

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});