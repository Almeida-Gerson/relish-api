export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
  website: string;
  address: {
    city: string;
    geo: {
      lat: string;
      lng: string;
    };
    street: string;
    suite: string;
    zipcode: string;
  };
  company: {
    bs: string;
    catchPhrase: string;
    name: string;
  };
}

export interface Album {
  id: number;
  title: string;
  userId?: number;
  user: User;
}

export interface Photo {
  id: number;
  albumId?: number;
  thumbnailUrl: string;
  title: string;
  url: string;
  album: Album;
}

export interface PhotoResponse {
  photos: Photo[];
  total: number;
}

export interface PhotosFilter {
  title: string;
  "album.title": string;
  "album.user.email": string;
  limit: number;
  offset: number;
}
