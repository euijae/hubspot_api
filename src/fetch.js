const _ = require('lodash');
const axios = require('axios');

async function fetchData() {
    try {
        let globalCompanyExistingIndex = {}
        let globalContactExistingIndex = {}
        let globalCompanyNewIndex = {}
        let globalContactNewIndex = {}

        const GET_URL = 'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=6031bfc8eb710d14f56cb246eefd';
        const response = await axios.get(GET_URL);
        const { existingAssociations, newAssociations } = response.data; 
        
        _.forEach(existingAssociations, ({ companyId, contactId, role }) => {
            _.set(
                globalCompanyExistingIndex, 
                [companyId, role],
                 _.uniq([...(globalCompanyExistingIndex[companyId]?.[role] || []), contactId])
            );
            _.set(
                globalContactExistingIndex, 
                [contactId, companyId], 
                _.uniq([...(globalContactExistingIndex[contactId]?.[companyId] || []), role])
            );
        });

        _.forEach(newAssociations, ({ companyId, contactId, role }) => {
            _.set(
                globalCompanyNewIndex, 
                [companyId, role],
                 _.uniq([...(globalCompanyNewIndex[companyId]?.[role] || []), contactId])
            );
            _.set(
                globalContactNewIndex, 
                [contactId, companyId], 
                _.uniq([...(globalContactNewIndex[contactId]?.[companyId] || []), role])
            );
        });

        return {
            globalCompanyExistingIndex,
            globalContactExistingIndex,
            globalCompanyNewIndex,
            globalContactNewIndex
        }
    } catch (error) {
        console.log('Something went wrong ... If it was a production code, it should have had more concrete error handling code here. > ' + error.message);
    }
}

module.exports = fetchData;