const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(
    playlistsService,
    songsService,
    activitiesService,
    tokenManager,
    validator
  ) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
    this._songsService = songsService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  postPlaylistHandler = async (request, h) => {
    this._validator.validatePlaylistPayload(request.payload);
    const { name: playlist } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist(
      playlist,
      credentialId
    );
    const response = h.response({
      status: 'success',
      message: 'Berhasil membuat playlist',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  };

  getPlaylistHandler = async (request) => {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  };

  deletePlaylistHandler = async (request) => {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylist(playlistId);
    return {
      status: 'success',
      message: 'Berhasil manghapus playlists',
    };
  };

  postPlaylistSongHandler = async (request, h) => {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;
    await this._songsService.verifySong(songId);

    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlistSongId = await this._playlistsService.addPlaylistSong(
      playlistId,
      songId
    );
    await this._activitiesService.addActivities(
      playlistId,
      songId,
      credentialId,
      'add'
    );
    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu pada playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  };

  getPlaylistSongHandler = async (request) => {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistsService.getPlaylistById(
      playlistId,
      credentialId
    );
    const songs = await this._playlistsService.getPlaylistSong(playlistId);
    playlist.songs = songs;
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  };

  deletePlaylistSongHandler = async (request) => {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistsService.deletePlaylistSong(songId);

    await this._activitiesService.addActivities(
      playlistId,
      songId,
      credentialId,
      'delete'
    );
    return {
      status: 'success',
      message: 'Berhasil menghapus lagu dari playlist',
    };
  };

  getPlaylistActivitiesHandler = async (request) => {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._activitiesService.getActivities(playlistId);
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  };
}

module.exports = PlaylistsHandler;
