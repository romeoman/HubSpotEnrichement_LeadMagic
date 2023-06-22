/*
Introduction:

The code snippet above is a HubSpot custom code action that is used to find the LinkedIn profile URL of a contact based on their work email address. It integrates with the LeadMagic API to retrieve the LinkedIn profile URL and updates the contact's properties in HubSpot with the obtained URL.

To use this code, you need to have the necessary access tokens for both the HubSpot API and the LeadMagic API configured in the environment variables.

The code performs the following steps:

Sets the authorization headers for HubSpot API requests using the provided access token.
Retrieves the work email of the contact currently enrolled in the workflow from the HubSpot API.
Sends a request to the LeadMagic API to retrieve the LinkedIn profile URL based on the contact's work email.
Extracts the LinkedIn profile URL from the LeadMagic API response.
Constructs the contact data object with the updated LinkedIn profile URL.
Sends a patch request to the HubSpot API to update the contact's properties with the LinkedIn profile URL.
Provides the output data to be used in a subsequent workflow action.
Handles any errors that occur during the process.
Please ensure that you have the necessary permissions and configurations in place to access the HubSpot API and the LeadMagic API for this code to function correctly.
*/

// Import required libraries
const hubspot = require('@hubspot/api-client');
const axios = require('axios');

// Update LinkedIn Profile URL for Contact
exports.main = (event, callback) => {
  // Use the access token to set the Authorization header for HubSpot API requests
  const hubspotConfig = {
    headers: {
      'Authorization': `Bearer ${process.env.ACCESSTOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  // Get the email address of the contact currently enrolled in the workflow
  axios.get(`https://api.hubapi.com/crm/v3/objects/contacts/${event.object.objectId}`, hubspotConfig)
    .then(contactResponse => {
      const email = contactResponse.data.properties.email;

      // Make a request to LeadMagic API to resolve the LinkedIn profile URL based on the contact's email address
      const options = {
        method: 'GET',
        headers: {
          'X-BLOBR-KEY': process.env.LEADMAGICAPI
        }
      };

      axios.get(`https://api.leadmagic.io/business/api/linkedin/profile/resolve/email?work_email=${email}`, options)
        .then(leadMagicResponse => {
          const linkedinUrl = leadMagicResponse.data.url;

          // Update the contact's properties in HubSpot with the LinkedIn profile URL
          const contactData = {
            properties: {
              linkedin_profile: linkedinUrl
            }
          };

          axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${event.object.objectId}`, contactData, hubspotConfig)
            .then(() => {
              // Provide data output to use as an input in the Copy to Property workflow action at a later stage
              callback({ outputFields: {} });
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};
