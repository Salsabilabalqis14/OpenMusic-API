const autoBind = require('auto-bind');

class UserAlbumLikesHandler {
  constructor(userAlbumLikesService, albumsService) {
    this._userAlbumLikesService = userAlbumLikesService;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postUserAlbumLikeByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.verifyAlbumId(albumId);
    await this._userAlbumLikesService.verifyUserAlbumLike(credentialId, albumId);

    const userAlbumLike = await this._userAlbumLikesService.addUserAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album Like berhasil ditambahkan',
      data: {
        userAlbumLike,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id: albumId } = request.params;

    const [likes, cache] = await this._userAlbumLikesService.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);

    if (cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteUserAlbumLikeByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.verifyAlbumId(albumId);

    await this._userAlbumLikesService.deleteUserAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Album Like berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = UserAlbumLikesHandler;
