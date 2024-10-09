const mapDBToAlbumModel = ({
  id,
  name,
  year,
  cover_url,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapDBToSongModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToAlbumModel, mapDBToSongModel };
