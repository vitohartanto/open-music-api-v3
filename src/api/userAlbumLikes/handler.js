const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(userAlbumLikesService, albumsService) {
    this._userAlbumLikesService = userAlbumLikesService;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postUserAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.getAlbumById(albumId);

    await this._userAlbumLikesService.likeAlbum(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil like albums',
    });
    response.code(201);
    return response;
  }

  async getUserAlbumLikeHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.getAlbumById(id);

    const { likes, from } = await this._userAlbumLikesService.getAlbumLikes(id);

    if (from === 'cache') {
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.code(200);
      response.header('X-Data-Source', from);
      return response;
    }

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    return response;
  }

  async deleteUserAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.getAlbumById(albumId);

    await this._userAlbumLikesService.unlikeAlbum(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil unlike albums',
    });
    response.code(200);
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
