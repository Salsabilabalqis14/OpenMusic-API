const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist_songs',
  version: '1.0.0',
  register: async (server, {
    playlistSongsService, playlistsService, playlistSongActivitiesService, validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(playlistSongsService, playlistsService, playlistSongActivitiesService, validator);
    server.route(routes(playlistSongsHandler));
  },
};
