/**
 * Stub verify cho ZaloPay – luôn trả về hợp lệ trong môi trường dev.
 * Có thể thay thế bằng triển khai thật sau này.
 *
 * @param {Object} queryOrBody
 * @returns {{ isValid: boolean, reason?: string }}
 */
function verifyZalopaySignature(queryOrBody) {
  if (!queryOrBody) {
    return { isValid: false, reason: 'Missing payload' };
  }

  // TODO: Implement real signature verification using ZaloPay keys
  return { isValid: true };
}

module.exports = {
  verifyZalopaySignature,
};




