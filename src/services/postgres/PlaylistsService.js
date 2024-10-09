const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  addPlaylist = async (name, owner) => {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  };

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN users
        ON users.id = playlists.owner
        FULL JOIN collaborations
        ON playlists.id = collaborations.playlist_id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists
      JOIN users
      ON playlists.owner = users.id 
      WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist song gagal ditambahkan');
    }

    await this._cacheService.delete(`playlist:${playlistId}`);
    return result.rows[0].id;
  }

  async getPlaylistSong(playlistId) {
    try {
      const result = await this._cacheService.get(`playlist:${playlistId}`);
      return JSON.parse(result);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      const query = {
        text: `SELECT songs.id, 
      songs.title, 
      songs.performer 
        FROM playlist_songs
        JOIN songs
        ON playlist_songs.song_id = songs.id 
        WHERE playlist_songs.playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      // Lagu-lagu pada playlist akan disimpan pada cache sebelum fungsi getPlaylistSong dikembalikan
      await this._cacheService.set(
        `playlist:${playlistId}`,
        JSON.stringify(result.rows)
      );

      return result.rows;
    }
  }

  async deletePlaylistSong(songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id, playlist_id',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist song gagal dihapus');
    }

    await this._cacheService.delete(`playlist:${result.rows[0].playlist_id}`);
  }

  async verifyPlaylistOwner(playlistId, ownerId) {
    await this.verifyPlaylist(playlistId);

    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    const { owner } = result.rows[0];
    if (owner !== ownerId) {
      throw new AuthorizationError('Anda tidak memiliki akses');
    }
  }

  async verifyPlaylistAccess(playlistId, ownerId) {
    try {
      await this.verifyPlaylistOwner(playlistId, ownerId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          ownerId
        );
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylist(playlistId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
