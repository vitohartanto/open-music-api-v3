const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivities(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO playlist_song_activities 
        VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }

    return result.rows[0].id;
  }
  async getActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title,
      playlist_song_activities.action,
      playlist_song_activities.time
          FROM playlist_song_activities
          JOIN playlists
          ON playlist_song_activities.playlist_id = playlists.id
          JOIN users
          ON playlists.owner = users.id
          JOIN songs
          ON playlist_song_activities.song_id = songs.id
          WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ActivitiesService;
