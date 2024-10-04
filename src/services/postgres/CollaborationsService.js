const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  //   addCollaboration: Fungsi untuk menambahkan kolaborasi
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan kolaborasi');
    }

    return result.rows[0].id;
  }

  // deleteCollaboration: Fungsi untuk menghapus kolaborasi
  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: `DELETE FROM collaborations 
        WHERE playlist_id = $1 AND user_id = $2
        RETURNING id`,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus kolaborasi');
    }
  }

  // verifyCollabolator: Fungsi untuk memeriksa apakah user merupakan kolabolator dari catatan
  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `SELECT * FROM collaborations 
        WHERE user_id = $1 AND playlist_id = $2`,
      values: [userId, playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Tidak memiliki kolaborasi');
    }
  }
}

module.exports = CollaborationsService;
