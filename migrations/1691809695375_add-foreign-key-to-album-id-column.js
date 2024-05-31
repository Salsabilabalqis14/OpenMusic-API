/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat song baru.
  pgm.sql("INSERT INTO albums(id, name, year) VALUES ('old_songs', 'old_songs', 0)");

  // mengubah nilai album_id pada sonhs yang album_id-nya bernilai NULL
  pgm.sql("UPDATE songs SET album_id = 'old_songs' WHERE album_id IS NULL");

  // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
  pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus constraint fk_songs.album_id_albums.id pada tabel songs
  pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');

  // mengubah nilai album_id old_songs pada note menjadi NULL
  pgm.sql("UPDATE songs SET album_id = NULL WHERE album_id = 'old_songs'");

  // menghapus song baru.
  pgm.sql("DELETE FROM albums WHERE id = 'old_songs'");
};
