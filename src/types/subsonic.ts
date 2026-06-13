export interface SubsonicCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface SubsonicArtist {
  id: string;
  name: string;
  coverArt?: string;
  albumCount?: number;
}

export interface SubsonicArtistIndex {
  name: string;
  artist: SubsonicArtist[];
}

export interface SubsonicAlbum {
  id: string;
  name: string;
  artist?: string;
  artistId?: string;
  coverArt?: string;
  songCount?: number;
  duration?: number;
  year?: number;
  genre?: string;
  song?: SubsonicSong[];
}

export interface SubsonicSong {
  id: string;
  title: string;
  album?: string;
  artist?: string;
  albumId?: string;
  artistId?: string;
  track?: number;
  year?: number;
  genre?: string;
  coverArt?: string;
  duration?: number;
  suffix?: string;
  contentType?: string;
  isDir?: boolean;
  type?: string;
}

export interface SubsonicPlaylist {
  id: string;
  name: string;
  comment?: string;
  owner?: string;
  songCount?: number;
  duration?: number;
  coverArt?: string;
  entry?: SubsonicSong[];
}

export interface SearchResult3 {
  artist?: SubsonicArtist[];
  album?: SubsonicAlbum[];
  song?: SubsonicSong[];
}
