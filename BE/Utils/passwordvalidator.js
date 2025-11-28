function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!password) {
    return { isValid: false, message: 'Mật khẩu là bắt buộc' };
  }

  if (password.length < minLength) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }

  if (!hasUpperCase) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }

  if (!hasLowerCase) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  }

  if (!hasNumbers) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
  }

  if (!hasSpecialChar) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' };
  }

  return { isValid: true, message: 'Mật khẩu hợp lệ' };
}

module.exports = validatePassword;