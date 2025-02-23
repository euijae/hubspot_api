const axios = require('axios');
const { fetchData, crmValidation } = require('./src');

const POST_URL = 'https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=6031bfc8eb710d14f56cb246eefd';
const headers = { 'Content-Type': 'application/json' };

/**
 * I would have used caching for these indexes if this were production code. 
 * The final result isn't working yet, but this has been a very interesting and engaging task for me.
 */
async function postData() {
    try {
        const dataFromGetEndpoint = await fetchData();
        const {validAssociations, invalidAssociations} = crmValidation(dataFromGetEndpoint);

        const requestData = {
            "validAssociations": validAssociations,
            "invalidAssociations": invalidAssociations
        };

        const response = await axios.post(POST_URL, requestData, { headers });
        console.log('Complete. ', response.status);
    } catch (error) {
        console.error('Something went wrong ... ', error.response ? error.response.data : error.message);
    }
}

postData();