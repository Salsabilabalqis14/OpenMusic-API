const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(songService, cacheService) {
    this._pool = new Pool();

    this._songService = songService;
    this._cacheService = cacheService;
  }

  async addSongToPlaylist(playlistId, songId) {
    await this._songService.verifySongId(songId);

    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan ke Playlist');
    }

    await this._cacheService.delete(`playlist-songs:${playlistId}`);

    return result.rows[0].id;
  }

  async getSongsOnPlaylist(playlistId) {
    try {
      const result = await this._cacheService.get(`playlist-songs:${playlistId}`);
      return [JSON.parse(result), true];
    } catch (error) {
      const query = {
        text: `SELECT playlists.id AS playlist_id, playlists.name, users.username, songs.id AS song_id, songs.title, songs.performer
              FROM playlists 
              JOIN users ON users.id = playlists.owner
              JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
              JOIN songs ON songs.id = playlist_songs.song_id
              WHERE playlist_songs.playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Playlist tidak ditemukan');
      }

      const playlistData = {
        id: result.rows[0].playlist_id,
        name: result.rows[0].name,
        username: result.rows[0].username,
        songs: result.rows.map((row) => ({
          id: row.song_id,
          title: row.title,
          performer: row.performer,
        })).filter((song) => song.id !== null),
      };

      await this._cacheService.set(`playlist-songs:${playlistId}`, JSON.stringify(playlistData));

      return [playlistData, false];
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Song gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`playlist-songs:${playlistId}`);
  }

  async verifySongOnPlaylist(songId) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE song_id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => row.playlist_id);
  }
}

module.exports = PlaylistSongsService;
