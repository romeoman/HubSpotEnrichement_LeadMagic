// Import required libraries
const axios = require('axios');
const hubspot = require('@hubspot/api-client');

exports.main = async (event) => {
  // Get the 'linkedin_company_page' and 'hs_object_id' from inputFields
  const liurl = event.inputFields['linkedin_company_page'];
  const hs_object_id = event.inputFields['hs_object_id'];

  // Make a request to LeadMagic API to retrieve contact information based on hubspot data of the enrolled contact
  const options = {
    method: 'GET',
    headers: {
      'X-BLOBR-KEY': process.env.LEADMAGICAPI
    }
  };

  // Make a request to LeadMagic API to retrieve contact information based on the linkedin_company_page of the enrolled contact
  let leadMagicResponse;
  try {
    leadMagicResponse = await axios.get(`https://api.leadmagic.io/business/api/linkedin/company?url=${liurl}`, options);
  } catch (error) {
    console.error(`Failed to retrieve data from LeadMagic API: ${error.message}`);
    return;
  }
  const data = leadMagicResponse.data;

  // Log the company ID and LinkedIn company page URL
  console.log('Company ID:', hs_object_id);
  console.log('LinkedIn Company Page URL:', liurl);

  // Slice the specialities array to only get the first 6 specialties
  const specialities = Array.isArray(data.specialities) ? data.specialities.slice(0, 6) : [];

  // Log all specialities found in LeadMagic
  console.log('LeadMagic Specialities:', specialities);

  // Instantiate HubSpot API client using the provided access token
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.ACCESSTOKEN
  });

  // Define the additional properties to update
  const additionalProperties = ['follower_count', 'universal_name_id', 'search_id'];

  // Update the properties directly without checking if they exist
  for (const property of additionalProperties) {
    try {
      const update = {
        properties: {
          [property]: data[property]
        }
      };
      await hubspotClient.crm.companies.basicApi.update(hs_object_id, update);
      console.log(`Successfully updated '${property}' property for company with id ${hs_object_id}`);
    } catch (error) {
      console.error(`Failed to update '${property}' property for company with id ${hs_object_id}: ${error.message}`);
      return;
    }
  }

  // Check if the 'specialities' property exists in the 'companies' object
  let specialitiesProperty;
  const objectType = 'companies'; // Adjust the object type here
  const propertyName = 'specialities'; // Adjust the property name here

  try {
    specialitiesProperty = await hubspotClient.crm.properties.coreApi.getByName(objectType, propertyName);
  } catch (error) {
    console.error(`Failed to retrieve '${propertyName}' property: ${error.message}`);
    return;
  }

  // Get the current values of the 'specialities' property for the company
  let currentSpecialities = [];
  try {
    const company = await hubspotClient.crm.companies.basicApi.getById(hs_object_id, [propertyName]); // Use hs_object_id to retrieve the company by ID
    if (company.body && company.body.properties && company.body.properties[propertyName]) {
      currentSpecialities = company.body.properties[propertyName].split(';');
    } else {
      console.log(`No '${propertyName}' property found for company with id ${hs_object_id}. A new one will be set.`);
    }
  } catch (error) {
    console.error(`Failed to retrieve current '${propertyName}' values for company with id ${hs_object_id}: ${error.message}`);
    return;
  }

  // Check if the provided specialities exist in the 'specialities' enumeration
  // and if they're not already set for the company
  let optionsToUpdate = [];
  let optionsNotUpdated = []; // Track values that are not in the enumeration

  for (let speciality of specialities) {
    if (specialitiesProperty.options.some(option => option.label.toLowerCase() === speciality.toLowerCase())) {
      if (!currentSpecialities.includes(speciality)) {
        optionsToUpdate.push(speciality);
      }
    } else {
      console.log(`Speciality ${speciality} does not exist in the '${propertyName}' enumeration. Skipping it.`);
      optionsNotUpdated.push(speciality); // Add to the list of values not updated
    }
  }

  // Limit the total number of specialities for a company to 10
  const maxSpecialities = 10;
  if (currentSpecialities.length + optionsToUpdate.length > maxSpecialities) {
    optionsToUpdate = optionsToUpdate.slice(0, maxSpecialities - currentSpecialities.length);
  }

  // If there are new options to add, update the 'specialities' property for the company
  if (optionsToUpdate.length > 0) {
    const newOptions = optionsToUpdate.map((speciality, index) => {
      return {
        label: speciality,
        description: speciality, // Modify this to suit your needs
        value: speciality, // Modify this to suit your needs
        displayOrder: currentSpecialities.length + index,
        hidden: false
      };
    });

    const propertyUpdate = {
      label: propertyName,
      type: 'enumeration',
      fieldType: 'checkbox',
      groupName: 'linkedin_information', // Replace 'linkedin_information' with the appropriate group name
      options: newOptions,
      displayOrder: 1, // Adjust this to the correct display order
      hidden: false,
      formField: true // Adjust this according to your needs
    };

    try {
      await hubspotClient.crm.properties.coreApi.update(objectType, propertyName, propertyUpdate);
      console.log(`Successfully updated '${propertyName}' property for company with id ${hs_object_id}`);
    } catch (error) {
      console.error(`Failed to update '${propertyName}' property for company with id ${hs_object_id}: ${error.message}`);
      return;
    }
  }

  // Log the updated and not updated specialities
  console.log('Updated Specialities:', optionsToUpdate);
  console.log('Not Updated Specialities:', optionsNotUpdated);

  // Add 'search_id' to the output
  data.search_id = data.search_id || '';

  // Return all the retrieved data as the output
  return {
    outputFields: data
  };
};
