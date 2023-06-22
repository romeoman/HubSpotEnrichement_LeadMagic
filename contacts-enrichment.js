/* 
This code takes the contact LinkedIn URL and enriches the contact

Introduction:

The code snippet above is a HubSpot custom code action that enriches a contact's properties based on their LinkedIn profile URL. It integrates with the LeadMagic API to retrieve additional information about the contact from their LinkedIn profile and updates the relevant properties in HubSpot.

To use this code, you need to have the necessary access tokens for both the HubSpot API and the LeadMagic API configured in the environment variables.

The code performs the following steps:

Sets the authorization headers for HubSpot API requests using the provided access token.
Retrieves the LinkedIn profile URL of the contact currently enrolled in the workflow.
Makes a request to the LeadMagic API to retrieve contact information based on the LinkedIn profile URL.
Extracts the required data from the LeadMagic API response.
Constructs the contact data object with the updated properties.
Sends a patch request to the HubSpot API to update the contact's properties with the enriched data.
Provides the output data to be used in a subsequent workflow action.
Handles any errors that occur during the process and logs appropriate error messages.
Please ensure that you have the necessary permissions and configurations in place to access the HubSpot API and the LeadMagic API for this code to function correctly.

Lead Magic Enrichment -> HubSpot Contacts
*/

// Import required libraries
const hubspot = require('@hubspot/api-client');
const axios = require('axios');

exports.main = (event, callback) => {
  // Configure headers for HubSpot API requests using the provided access token
  const hubspotConfig = {
    headers: {
      'Authorization': `Bearer ${process.env.ACCESSTOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  // Get the 'linkedin_profile' of the contact currently enrolled in the workflow
  const liurl = event.inputFields['linkedin_profile'];

  // Make a request to LeadMagic API to retrieve contact information based on the linkedin_profile of the enrolled contact
  const options = {
    method: 'GET',
    headers: {
      'X-BLOBR-KEY': process.env.LEADMAGICAPI
    }
  };

  axios.get(`https://api.leadmagic.io/business/api/v2/linkedin?url=${liurl}&fallback_to_cache=never`, options)
    .then(response => {
      // Extract the required data from the LeadMagic API response
      const data = response.data;

      // Convert languages array to a comma-separated string
      const languages = Array.isArray(data.languages) ? data.languages.join(', ') : '';

      // Update the relevant contact properties within HubSpot
      const contactData = {
        properties: {
          city: data.city,
          country: data.country_full_name,
          firstname: data.first_name,
          jobtitle: data.occupation,
          linkedin_headline: data.headline,
          linkedin_profile_picture: data.profile_pic_url,
          lastname: data.last_name,
          linkedin_followers: data.follower_count,
          linkedin_profile_summary: data.summary,
          state: data.state,
          languages: languages,
        }
      };

      // Make a request to HubSpot API to update the contact properties
      axios.patch(`https://api.hubapi.com/crm/v3/objects/contacts/${event.object.objectId}`, contactData, hubspotConfig)
        .then(() => {
          // Provide data output to use as an input in the Copy to Property workflow action at a later stage
          callback({ outputFields: {} });
        })
        .catch(err => {
          console.error('HubSpot API Error:', err.response.data);
        });
    })
    .catch(err => {
      console.error('LeadMagic API Error:', err);
    });
};
