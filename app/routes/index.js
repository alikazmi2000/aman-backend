const { handleError, buildErrObject } = require('../middleware/utils');
const { ErrorCodes } = require('../enums');

module.exports = function(app) {
  app.use((req, res, next) => {
    console.log(req.method, '//', req.originalUrl);
    next()
  })

  try {
    app.use(`/${process.env.API_BASE_ROUTE}/backoffice`, require('./backoffice')); // For SuperAdmin/Admin Panel APIS
    app.use(`/${process.env.API_BASE_ROUTE}/api`, require('./api')) //Public Sites APIS Related .
    app.use(`/${process.env.API_BASE_ROUTE}/webhook`, require('./webhook')) //Webhooks Related routes .

  } catch (error) {
    console.log(error);
  }

  app.get('/', (req, res) => {
    res.render('index');
  });

  /*
 * Handle 404 error
 */
app.use('*', (req, res) => {
  handleError(req, res, buildErrObject({ ...ErrorCodes.ENDPOINT_NOT_FOUND }));
});


}
