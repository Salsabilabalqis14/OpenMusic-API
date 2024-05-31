const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongActivitiesService {
  constructor(playlistService) {
    this._pool = new Pool();

    this._playlistService = playlistService;
  }

  async addPlaylistSongActivities(playlistId, songId, userId, action) {
    const id = `playlist-song-activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Activity Playlist Song gagal ditambahkan');
    }
  }

  async getPlaylistSongActivities(playlistId) {
    await this._playlistService.verifyPlaylistId(playlistId);

    const query = {
      text: `SELECT playlist_song_activities.id, playlist_song_activities.playlist_id, users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
            FROM playlist_song_activities
            JOIN songs ON songs.id = playlist_song_activities.song_id
            JOIN users ON users.id = playlist_song_activities.user_id
            WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Song Activities tidak ditemukan');
    }

    const activitiesData = {
      playlistId: result.rows[0].playlist_id,
      activities: result.rows.map((row) => ({
        username: row.username,
        title: row.title,
        action: row.action,
        time: row.time,
      })),
    };

    return activitiesData;
  }
}

module.exports = PlaylistSongActivitiesService;
