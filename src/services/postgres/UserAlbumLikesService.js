const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(userId, albumId) {
    const id = `user-album-like${nanoid(16)}`;

    const alreadyLike = await this.verifyAlbumLike(userId, albumId);
    if (alreadyLike) {
      throw new ClientError('Album sudah dilike sebelumnya');
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('User gagal like album');
    }

    await this._cacheService.delete(`album-like:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    const alreadyLike = await this.verifyAlbumLike(userId, albumId);
    if (!alreadyLike) {
      throw new ClientError('Album belum dilike sebelumnya');
    }

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('User gagal unlike album');
    }

    await this._cacheService.delete(`album-like:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this._cacheService.get(`album-like:${albumId}`);
      return {
        likes: JSON.parse(result),
        from: 'cache',
      };
    } catch {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(
        `album-like:${albumId}`,
        JSON.stringify(result.rowCount),
        1800
      );
      return {
        likes: result.rowCount,
      };
    }
  }

  async verifyAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    const like = result.rowCount;

    return like;
  }
}

module.exports = UserAlbumLikesService;
