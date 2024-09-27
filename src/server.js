require('dotenv').config();
const Hapi = require('@hapi/hapi');

const init = async () => {
  // Membuat server di port 3000
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  // Memulai Server
  await server.start();
  console.log('Server running on %s', server.info.uri);
};
