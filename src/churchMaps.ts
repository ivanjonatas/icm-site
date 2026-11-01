import type {Church} from './types';

type Destination = {
  lat: number;
  lng: number;
  placeId?: string;
};

const destinations: Record<string, Destination> = {
  alenquer: {
    lat: 39.0554551,
    lng: -9.0074812,
    placeId: 'ChIJv4jeSQDbGA0RLFy5RpPCt-Q',
  },
  amadora: {
    lat: 38.7420563,
    lng: -9.2172249,
    placeId: 'ChIJA7yRpZLNHg0R4UUkUWUw9DM',
  },
  braga: {
    lat: 41.5395737,
    lng: -8.4339776,
    placeId: 'ChIJIwW60ab9JA0RoqDZ-OxvAVw',
  },
  'caldas-da-rainha': {
    lat: 39.4056137,
    lng: -9.1416504,
    placeId: 'ChIJe8zeaDizGA0Rwn3RbDhabyU',
  },
  carregado: {
    lat: 39.0218373,
    lng: -8.9726273,
    placeId: 'ChIJL8kK4FDZGA0RWtbJ2HCq7eQ',
  },
  cartaxo: {
    lat: 39.1593244,
    lng: -8.7896214,
    placeId: 'ChIJK7zLVBXpGA0RWb9dkz5ZRgk',
  },
  coimbra: {
    lat: 40.2019416,
    lng: -8.4347325,
    placeId: 'ChIJRce9ahT5Ig0RbNrzu9EoE_s',
  },
  'cruz-pau-amora': {
    lat: 38.6202754,
    lng: -9.1201971,
    placeId: 'ChIJj0kH7LBLGQ0Ri-OyHMqxuRw',
  },
  entroncamento: {
    lat: 39.4568846,
    lng: -8.4760702,
    placeId: 'ChIJUemvkmdjGA0RiByk6aUCY8A',
  },
  estarreja: {
    lat: 40.7544823,
    lng: -8.5728234,
    placeId: 'ChIJ50dSb4ebIw0Rn7GcszgkMQo',
  },
  evora: {
    lat: 38.5574876,
    lng: -7.9182127,
    placeId: 'ChIJByVagAblGQ0Ruhq5FRdXAF0',
  },
  famalicao: {
    lat: 41.3603303,
    lng: -8.5525257,
    placeId: 'ChIJRTQZPQBfJA0RtYtiS2k4SBY',
  },
  faro: {
    lat: 37.0268759,
    lng: -7.9321657,
    placeId: 'ChIJeVsXRwBTBQ0RJRfnqTX0spk',
  },
  leiria: {
    lat: 39.740213,
    lng: -8.8040644,
    placeId: 'ChIJO14d729zIg0R8p7sl4h2OSw',
  },
  lisboa: {
    lat: 38.7440758,
    lng: -9.1458258,
    placeId: 'ChIJIUF2ZmYzGQ0RATdjIm6ffqI',
  },
  'maanaim-de-portugal': {
    lat: 38.859693,
    lng: -9.0807128,
    placeId: 'ChIJxeSFOjgvGQ0RlR2JKRFsc8Q',
  },
  mafra: {
    lat: 38.9404533,
    lng: -9.3335102,
    placeId: 'ChIJrz76PzHXHg0RQTL7tlngKzQ',
  },
  maia: {
    lat: 41.203123,
    lng: -8.5589956,
  },
  montijo: {
    lat: 38.7039896,
    lng: -8.9698735,
    placeId: 'ChIJ_yuzOF85GQ0RU0A9gGSjYBo',
  },
  odivelas: {
    lat: 38.7956246,
    lng: -9.1750693,
    placeId: 'ChIJP13o5VgtGQ0ROzRXr1zj8WM',
  },
  portimao: {
    lat: 37.1393904,
    lng: -8.5404439,
    placeId: 'ChIJeZRj4lUpGw0R_PGLsoFrIZ0',
  },
  porto: {
    lat: 41.1683402,
    lng: -8.5849158,
    placeId: 'ChIJtfwkxeplJA0RcXiLodoksQM',
  },
  queluz: {
    lat: 38.7544264,
    lng: -9.2560708,
    placeId: 'ChIJBZTyVbbNHg0RPPQFKPdpkqE',
  },
  setubal: {
    lat: 38.5263878,
    lng: -8.8855516,
    placeId: 'ChIJIxkbZxdDGQ0RjNCLRttmdms',
  },
  viseu: {
    lat: 40.63138888888889,
    lng: -7.9075,
  },
};

export function churchMapsUrl(
  church: Pick<Church, 'id' | 'name' | 'address'>,
  mode: 'place' | 'directions' = 'place'
): string {
  const destination = destinations[church.id];
  const address = church.address.trim().replace(/\s+/g, ' ');

  const normalise = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const locality = normalise(address).includes(normalise(church.name))
    ? ''
    : church.name;

  const fallback = [
    address,
    locality,
    /\bPortugal\b/i.test(address) ? '' : 'Portugal',
  ]
    .filter(Boolean)
    .join(', ');

  const point = destination
    ? destination.lat + ',' + destination.lng
    : fallback;

  const directions = mode === 'directions';

  const url = new URL(
    'https://www.google.com/maps/' +
    (directions ? 'dir/' : 'search/')
  );

  url.searchParams.set('api', '1');
  url.searchParams.set(
    directions ? 'destination' : 'query',
    point
  );

  if (destination?.placeId) {
    url.searchParams.set(
      directions ? 'destination_place_id' : 'query_place_id',
      destination.placeId
    );
  }

  return url.toString();
}