/**
 * Unified API Response Formatter
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {any} [data=null] - Payload to return (optional)
   */
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }

  /**
   * Sends the formatted JSON response back to the client.
   * @param {object} res - Express response object
   */
  send(res) {
    const payload = {
      success: this.success,
      message: this.message
    };
    
    if (this.data !== null && this.data !== undefined) {
      payload.data = this.data;
    }

    return res.status(this.statusCode).json(payload);
  }
}

module.exports = ApiResponse;
