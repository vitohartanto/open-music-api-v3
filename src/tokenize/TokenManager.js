const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');

const TokenManager = {
  // Membuat atau men-generate access token (generateAccessToken)
  generateAccessToken(payload) {
    return Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY);
  },

  // Membuat atau men-generate refresh token (generateRefreshToken)
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

  // Memverifikasi refresh token (verifyRefreshToken)
  // Agar tidak menimbulkan server eror, kita tangani seluruh fungsi verifyRefreshToken dengan try dan catch
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      // Fungsi verifySignature ini akan mengecek apakah refresh token memiliki signature yang sesuai atau tidak
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      //   Nilai payload tersebut nantinya akan digunakan dalam membuat akses token baru
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};

module.exports = TokenManager;
