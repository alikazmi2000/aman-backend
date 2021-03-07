const SquareConnect = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;
// Set sandbox url
defaultClient.basePath = 'https://connect.squareupsandbox.com';
// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
// Set sandbox access token
oauth2.accessToken = "EAAAEBLc_I-dPxQO6FvLrQLeLM_DP2PvKzWFY8nEFz0Ndi1TWRz30jeGpPbJomr0";
// Pass client to API
const api = new SquareConnect.LocationsApi();
return api;