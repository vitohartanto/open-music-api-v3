const routes = require('./routes');
const PlaylistsHandler = require('./handler');

module.exports = {
  name: 'openmusic-playlists',
  version: '1.0.0',
  register: async (
    server,
    {
      playlistsService,
      songsService,
      activitiesService,
      tokenManager,
      validator,
    }
  ) => {
    const playlistHandler = new PlaylistsHandler(
      playlistsService,
      songsService,
      activitiesService,
      tokenManager,
      validator
    );

    server.route(routes(playlistHandler));
  },
};
