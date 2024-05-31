const autoBind = require('auto-bind');

class SongsHandler {
  constructor(songsService, playlistSongsService, cacheService, validator) {
    this._songsService = songsService;
    this._playlistSongsService = playlistSongsService;
    this._cacheService = cacheService;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;

    const songId = await this._songsService.addSong({
      title, year, genre, performer, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const { title } = request.query;
    const { performer } = request.query;

    const songs = await this._songsService.getSongs(title, performer);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._songsService.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._songsService.editSongById(id, request.payload);

    const existingOnPlaylist = await this._playlistSongsService.verifySongOnPlaylist(id);
    if (existingOnPlaylist) {
      existingOnPlaylist.forEach(async (playlistId) => {
        await this._cacheService.delete(`playlist-songs:${playlistId}`);
      });
    }

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._songsService.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
