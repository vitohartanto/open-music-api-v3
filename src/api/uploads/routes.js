const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadAlbumCoverHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512 * 1000, // 512 kB
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/cover/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file/covers'),
      },
    },
  },
];

module.exports = routes;
