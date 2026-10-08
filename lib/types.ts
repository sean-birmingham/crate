export type Artist = { id: string; name: string };

export type Album = {
  id: string;
  title: string;
  artistId: string;
  year: number;
  cover: string;
  genre?: string;
};

export type Track = {
  id: string;
  title: string;
  albumId: string;
  artistId: string;
  side: string; // "A1", "B2"
  duration: number; // seconds
  src: string;
};

export type Playlist = { id: string; name: string; trackIds: string[] };

export type Db = {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
  playlists: Playlist[];
  likes: string[];
  savedAlbums: string[]; // album ids, newest first
};

export type AlbumWithArtist = Album & { artist: Artist };

export type PlayableTrack = Track & {
  artistName: string;
  albumTitle: string;
  cover: string;
};

export type TopResult =
  | { kind: "artist"; artist: Artist }
  | { kind: "album"; album: AlbumWithArtist }
  | { kind: "track"; track: PlayableTrack }
  | { kind: "genre"; name: string; albumCount: number };

export type PlaylistSummary = {
  id: string;
  name: string;
  trackCount: number;
  covers: string[];
};
