## Tests and Test Coverage

The HubSpotEnrichment_LeadMagic project includes automated tests to ensure code quality and reliability. The tests cover various functionalities and scenarios to verify the expected behavior of the code.

### Running Tests

To run the tests in the HubSpotEnrichment_LeadMagic project, follow these steps:

1. Ensure that you have all the necessary dependencies installed, including the required testing frameworks (if any).
2. Open the terminal or command line interface.
3. Navigate to the root directory of the project.
4. Run the command `npm test` or `yarn test` to execute the test suite.
5. Observe the test results in the terminal or command line interface.

### Test Coverage

The project aims to maintain a high level of test coverage to ensure thorough testing of the codebase. Test coverage provides insights into the percentage of code that is covered by automated tests.

The specific test coverage metrics for the HubSpotEnrichment_LeadMagic project may vary depending on the testing framework used and the testing approach taken. To assess the test coverage, you can use tools like Istanbul, Jest, or other test coverage analysis tools.

### Testing with Postman

One of the easiest ways to test the functionality of the HubSpotEnrichment_LeadMagic project is by using Postman. Postman allows you to send API requests, inspect responses, and verify the behavior of the integration with the LeadMagic API.

To test the project using Postman, follow these steps:

1. Install Postman (if you haven't already) from [https://www.postman.com/](https://www.postman.com/).
2. Obtain the necessary API credentials and endpoints from the project documentation.
3. Open Postman and create a new request.
4. Set the HTTP method (e.g., GET, POST, PATCH) and enter the relevant endpoint URL.
5. Customize the request headers, query parameters, and request body as required.
6. Click the "Send" button to execute the request and observe the response.
7. Inspect the response data and verify that it aligns with the expected behavior.

Using Postman simplifies the testing process and allows you to interact with the API endpoints directly, making it easier to validate the integration with the LeadMagic API.

### LeadMagic API Testing

For testing the integration with the LeadMagic API, we recommend utilizing the LeadMagic test endpoints available at [https://portal.leadmagic.io/](https://portal.leadmagic.io/). These endpoints provide a dedicated environment for testing and validating the interaction between the HubSpotEnrichment_LeadMagic project and the LeadMagic API.

To facilitate testing, it is also recommended to include a business manifest provided by LeadMagic and a business definition file. These files help define and configure the business-specific aspects of the integration.

### HubSpot API Documentation

For further information about integrating with HubSpot, consult the [HubSpot API documentation](https://developers.hubspot.com/). The documentation provides comprehensive details about HubSpot's APIs, including available endpoints, authentication methods, request and response formats, and examples.

