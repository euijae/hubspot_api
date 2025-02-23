const _ = require('lodash');
const axios = require('axios');
const GET_URL = 'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=6031bfc8eb710d14f56cb246eefd';

async function fetchData() {
    try {
        const response = await axios.get(GET_URL);
        // const data = await response.json();
        console.log(response.data);
    } catch (error) {
        console.log('Something went wrong ...' + error.message);
    }
}

fetchData();