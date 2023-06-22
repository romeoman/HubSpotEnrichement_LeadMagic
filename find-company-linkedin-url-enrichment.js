// LinkedIn Company URL -> HubSpot Companies

// This code snippet is used to retrieve the LinkedIn company URL using the LeadMagic API and update the relevant company properties in HubSpot.
// It retrieves the LinkedIn company URL based on the company name, domain, and location from the inputFields of the enrolled company in the workflow.
// The retrieved URL is then used to update the `linkedin_company_page` property for the company in HubSpot.

// Import required libraries
const axios = require('axios');

exports.main = (event, callback) => {

    // Get the 'company name', 'company domain', 'company location' of the company currently enrolled in the workflow from inputFields
    const name = event.inputFields['name'];
    const domain = event.inputFields['domain'];
    const country = event.inputFields['country']; 

    // Configure headers for HubSpot API requests using the provided access token
    const hubspotConfig = {
        headers: {
            'Authorization': `Bearer ${process.env.ACCESSTOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    // Make a request to LeadMagic API to retrieve contact information based on hubspot data of the enrolled company
    const options = {
        method: 'GET',
        headers: {
            'X-BLOBR-KEY': process.env.LEADMAGICAPI
        }
    };

    // Make a request to LeadMagic API to retrieve contact information based on the company name, domain, and location
    axios.get(`https://api.leadmagic.io/business/api/linkedin/company/resolve?company_location=${country}&company_domain=${domain}&company_name=${name}`, options)
    .then(response => {
        // Extract the required data from the LeadMagic API response
        const data = response.data;

        // Update the relevant company properties within HubSpot
        const companyPropertiesToUpdate = {
            linkedin_company_page: data.url
        };
        
        // Make a request to HubSpot API to update the company properties
        axios.patch(`https://api.hubapi.com/crm/v3/objects/company/${event.object.objectId}`, { properties: companyPropertiesToUpdate }, hubspotConfig)
        .then(() => {
            // Provide data output to use as an input in the Copy to Property workflow action at a later stage
            callback({ outputFields: {} });
        })
        .catch(err => {
            console.error("Error updating company properties in HubSpot:", err.message);
            console.error(err.stack);
        });
    })
    .catch(err => {
        console.error("Error retrieving contact information from LeadMagic API:", err.message);
        console.error(err.stack);
    });
};
