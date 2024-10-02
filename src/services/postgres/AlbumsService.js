const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToAlbumModel } = require('../../utils/index');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  addAlbum = async ({ name, year }) => {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  };

  getAlbums = async () => {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToAlbumModel);
  };

  getAlbumById = async (id) => {
    // Query untuk mengambil detail album berdasarkan albumId
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(albumQuery);

    // Jika album tidak ditemukan
    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    // Query untuk mengambil lagu-lagu berdasarkan albumId
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);

    // Gabungkan album dan lagu-lagu ke dalam satu object
    const album = albumResult.rows.map(mapDBToAlbumModel)[0]; // memetakan hasil album ke model
    album.songs = songsResult.rows; // menambahkan properti songs ke album

    // Mengembalikan response album dengan daftar lagu
    return album;
  };

  editAlbumById = async (id, { name, year }) => {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  };

  deleteAlbumById = async (id) => {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  };
}

module.exports = AlbumsService;
