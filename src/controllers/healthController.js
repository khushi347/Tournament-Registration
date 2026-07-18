const ApiResponse = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatuses');
const MESSAGES = require('../constants/messages');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Health Check Controller
 */
const getHealth = asyncHandler(async (req, res) => {
  new ApiResponse(HTTP_STATUS.OK, MESSAGES.HEALTH.OK, { status: 'OK' }).send(res);
});

module.exports = {
  getHealth
};
