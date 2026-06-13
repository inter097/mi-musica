import CryptoJS from 'crypto-js';
import type {
  SearchResult3,
  SubsonicAlbum,
  SubsonicArtist,
  SubsonicArtistIndex,
  SubsonicPlaylist,
  SubsonicSong,
} from '../types/subsonic';

export const API_VERSION = '1.16.1';
export const CLIENT_NAME = 'MiMusica';

export class SubsonicError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'SubsonicError';
    this.code = code;
  }
}

function randomSalt(): string {
  let salt = '';
  for (let i = 0; i < 12; i++) {
    salt += Math.floor(Math.random() * 16).toString(16);
  }
  return salt;
}

/**
 * Thin client for the Subsonic API used by Navidrome. Generates a fresh
 * token = md5(password + salt) per instance so the plaintext password is
 * never sent over the network.
 */
export class SubsonicClient {
  readonly serverUrl: string;
  readonly username: string;
  private readonly token: string;
  private readonly salt: string;

  constructor(serverUrl: string, username: string, password: string) {
    this.serverUrl = serverUrl.replace(/\/+$/, '');
    this.username = username;
    this.salt = randomSalt();
    this.token = CryptoJS.MD5(password + this.salt).toString();
  }

  private authParams(): Record<string, string> {
    return {
      u: this.username,
      t: this.token,
      s: this.salt,
      v: API_VERSION,
      c: CLIENT_NAME,
      f: 'json',
    };
  }

  /** Builds a fully authenticated URL for an endpoint, e.g. for streaming or cover art. */
  buildUrl(endpoint: string, params: Record<string, string | number | undefined> = {}): string {
    const search = new URLSearchParams();
    const all = { ...this.authParams(), ...params };
    for (const [key, value] of Object.entries(all)) {
      if (value !== undefined) {
        search.append(key, String(value));
      }
    }
    return `${this.serverUrl}/rest/${endpoint}?${search.toString()}`;
  }

  private async request<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new SubsonicError(`Error de red (${response.status})`);
    }

    const json = await response.json();
    const body = json['subsonic-response'];

    if (!body) {
      throw new SubsonicError('Respuesta inválida del servidor');
    }

    if (body.status !== 'ok') {
      throw new SubsonicError(
        body.error?.message ?? 'Error desconocido del servidor',
        body.error?.code
      );
    }

    return body as T;
  }

  getCoverArtUrl(coverArt?: string, size = 300): string | undefined {
    if (!coverArt) return undefined;
    return this.buildUrl('getCoverArt.view', { id: coverArt, size });
  }

  getStreamUrl(id: string): string {
    return this.buildUrl('stream.view', { id });
  }

  async ping(): Promise<void> {
    await this.request('ping.view');
  }

  async getArtists(): Promise<SubsonicArtistIndex[]> {
    const data = await this.request<{ artists: { index?: SubsonicArtistIndex[] } }>('getArtists.view');
    return data.artists.index ?? [];
  }

  async getArtist(id: string): Promise<SubsonicArtist & { album?: SubsonicAlbum[] }> {
    const data = await this.request<{ artist: SubsonicArtist & { album?: SubsonicAlbum[] } }>('getArtist.view', { id });
    return data.artist;
  }

  async getAlbumList2(
    type: 'newest' | 'recent' | 'frequent' | 'random' | 'alphabeticalByName' = 'newest',
    size = 20,
    offset = 0
  ): Promise<SubsonicAlbum[]> {
    const data = await this.request<{ albumList2: { album?: SubsonicAlbum[] } }>('getAlbumList2.view', {
      type,
      size,
      offset,
    });
    return data.albumList2.album ?? [];
  }

  async getAlbum(id: string): Promise<SubsonicAlbum> {
    const data = await this.request<{ album: SubsonicAlbum }>('getAlbum.view', { id });
    return data.album;
  }

  async getPlaylists(): Promise<SubsonicPlaylist[]> {
    const data = await this.request<{ playlists: { playlist?: SubsonicPlaylist[] } }>('getPlaylists.view');
    return data.playlists.playlist ?? [];
  }

  async getPlaylist(id: string): Promise<SubsonicPlaylist> {
    const data = await this.request<{ playlist: SubsonicPlaylist }>('getPlaylist.view', { id });
    return data.playlist;
  }

  async search3(query: string): Promise<SearchResult3> {
    const data = await this.request<{ searchResult3: SearchResult3 }>('search3.view', {
      query,
      artistCount: 20,
      albumCount: 20,
      songCount: 30,
    });
    return data.searchResult3;
  }
}

export function songToStreamableTrack(client: SubsonicClient, song: SubsonicSong) {
  return {
    id: song.id,
    url: client.getStreamUrl(song.id),
    title: song.title,
    artist: song.artist ?? 'Desconocido',
    album: song.album,
    artwork: client.getCoverArtUrl(song.coverArt),
    duration: song.duration,
  };
}
