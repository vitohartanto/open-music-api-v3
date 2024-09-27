const Hapi = require('@hapi/hapi');

const init = async () => {
  // Membuat server di port 3000
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });
};
