const autoBind = require('auto-bind');

class PlaylistSongActivitiesHandler {
  constructor(playlistSongActivitiesService, playlistsService) {
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async getActivitiesPlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const data = await this._playlistSongActivitiesService.getPlaylistSongActivities(playlistId);

    const response = h.response({
      status: 'success',
      data,
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongActivitiesHandler;
