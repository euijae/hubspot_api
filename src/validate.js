const _ = require('lodash');

let validAssociations = []
let invalidAssociations = []

const MAX_CONTACTS_PER_ROLE = 5
const MAX_ROLES_PER_CONTACT = 2;

const validate = (globalIndexes) => {
    const {
        globalCompanyExistingIndex, 
        globalContactExistingIndex, 
        globalCompanyNewIndex, 
        globalContactNewIndex
    } = globalIndexes;

    // duplicate user
    _.forEach(globalCompanyNewIndex, (roles, companyId) => {
        _.forEach(roles, (contactIds, role) => {
            contactIds.forEach(contactId => {
                // Check if the user already exists
                if (
                    globalCompanyExistingIndex[companyId] &&
                    globalCompanyExistingIndex[companyId][role] &&
                    globalCompanyExistingIndex[companyId][role].includes(contactId)
                ) {
                    // Add to invalidAssociations
                    invalidAssociations.push({
                        companyId: parseInt(companyId),
                        contactId: contactId,
                        role: role,
                        failureReason: "ALREADY_EXISTS"
                    });

                    // Remove the existing user from globalCompanyNewIndex
                    _.pull(globalCompanyNewIndex[companyId][role], contactId);

                    // If the role array is empty, remove the role key
                    if (_.isEmpty(globalCompanyNewIndex[companyId][role])) {
                        delete globalCompanyNewIndex[companyId][role];
                    }

                    // If the company key is empty, remove the company key
                    if (_.isEmpty(globalCompanyNewIndex[companyId])) {
                        delete globalCompanyNewIndex[companyId];
                    }
                } else {
                    // Add to validAssociations
                    validAssociations.push({
                        companyId: parseInt(companyId),
                        contactId: contactId,
                        role: role
                    });
                }
            });
        });
    });

    // For a given role at a company, at most five contacts can be associated
    _.forEach(globalCompanyNewIndex, (roles, companyId) => {
        _.forEach(roles, (contactIds, role) => {
            const existingContacts = globalCompanyExistingIndex[companyId]?.[role] || [];
            let currentCount = existingContacts.length;

            contactIds.forEach(contactId => {
                if (currentCount >= MAX_CONTACTS_PER_ROLE) {
                    // If limit exceeded, add to invalidAssociations
                    const invalidEntry = {
                        companyId: parseInt(companyId),
                        contactId: contactId,
                        role: role,
                        failureReason: "WOULD_EXCEED_LIMIT"
                    };

                    if (!_.some(invalidAssociations, invalidEntry)) {
                        invalidAssociations.push(invalidEntry);
                    }

                    // Remove from globalCompanyNewIndex
                    _.pull(globalCompanyNewIndex[companyId][role], contactId);
                } else {
                    // Otherwise, add to validAssociations
                    const validEntry = {
                        companyId: parseInt(companyId),
                        contactId: contactId,
                        role: role
                    };

                    if (!_.some(validAssociations, validEntry)) {
                        validAssociations.push(validEntry);
                    }

                    currentCount++; // Increment count after adding a valid contact
                }
            });

            // Cleanup: Remove empty role arrays
            if (_.isEmpty(globalCompanyNewIndex[companyId][role])) {
                delete globalCompanyNewIndex[companyId][role];
            }
        });

        // Cleanup: Remove empty company entries
        if (_.isEmpty(globalCompanyNewIndex[companyId])) {
            delete globalCompanyNewIndex[companyId];
        }
    });

    // For a given contact at a company, associations can be made for at most two roles
    _.forEach(globalContactNewIndex, (companies, contactId) => {
        _.forEach(companies, (roles, companyId) => {
            roles = _.get(globalContactNewIndex, [contactId, companyId], []);

            if (!Array.isArray(roles)) {
                return;
            }

            const existingRoles = _.get(globalContactExistingIndex, [contactId, companyId], []);
            let currentCount = existingRoles.length;

            roles.forEach(role => {
                if (currentCount >= MAX_ROLES_PER_CONTACT) {
                    // If limit exceeded, add to invalidAssociations
                    const invalidEntry = {
                        companyId: parseInt(companyId),
                        contactId: parseInt(contactId),
                        role: role,
                        failureReason: "WOULD_EXCEED_LIMIT"
                    };

                    if (!_.some(invalidAssociations, invalidEntry)) {
                        invalidAssociations.push(invalidEntry);
                    }

                    // Remove invalid role from globalContactNewIndex
                    _.pull(globalContactNewIndex[contactId][companyId], role);
                } else {
                    // Otherwise, add to validAssociations
                    const validEntry = {
                        companyId: parseInt(companyId),
                        contactId: parseInt(contactId),
                        role: role
                    };

                    if (!_.some(validAssociations, validEntry)) {
                        validAssociations.push(validEntry);
                    }

                    currentCount++; // Increment count after adding a valid role
                }
            });

            // Cleanup: Remove empty company-role arrays
            if (_.isEmpty(globalContactNewIndex[contactId][companyId])) {
                delete globalContactNewIndex[contactId][companyId];
            }
        });

        // Cleanup: Remove empty contact entries
        if (_.isEmpty(globalContactNewIndex[contactId])) {
            delete globalContactNewIndex[contactId];
        }
    });
}

const crmValidation = (globalIndexes) => {
    // duplicate user
    validate(globalIndexes);
    return { validAssociations, invalidAssociations }
}

module.exports = crmValidation