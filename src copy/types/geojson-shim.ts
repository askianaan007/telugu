/**
 * Minimal GeoJSON typings as a real ES module.
 * `paths` maps `geojson` here so `@types/d3-geo` resolves without TS2306 on `@types/geojson`.
 */
export type GeoJsonTypes = string

export interface GeoJsonObject {
  type: GeoJsonTypes
  bbox?: number[]
}

export type GeoJsonProperties = { [name: string]: unknown } | null
export type Position = [number, number] | [number, number, number]

export interface Point extends GeoJsonObject {
  type: 'Point'
  coordinates: Position
}
export interface MultiPoint extends GeoJsonObject {
  type: 'MultiPoint'
  coordinates: Position[]
}
export interface LineString extends GeoJsonObject {
  type: 'LineString'
  coordinates: Position[]
}
export interface MultiLineString extends GeoJsonObject {
  type: 'MultiLineString'
  coordinates: Position[][]
}
export interface Polygon extends GeoJsonObject {
  type: 'Polygon'
  coordinates: Position[][]
}
export interface MultiPolygon extends GeoJsonObject {
  type: 'MultiPolygon'
  coordinates: Position[][][]
}
export interface GeometryCollection<G extends Geometry = Geometry> extends GeoJsonObject {
  type: 'GeometryCollection'
  geometries: G[]
}

export type Geometry =
  | Point
  | MultiPoint
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon
  | GeometryCollection

export type GeometryObject = Geometry

export interface Feature<
  G extends Geometry | null = Geometry,
  P = GeoJsonProperties,
> extends GeoJsonObject {
  type: 'Feature'
  geometry: G
  properties?: P
  id?: string | number
}

export interface FeatureCollection<
  G extends Geometry | null = Geometry,
  P = GeoJsonProperties,
> extends GeoJsonObject {
  type: 'FeatureCollection'
  features: Feature<G, P>[]
}

export type GeoJSON<G extends Geometry | null = Geometry, P = GeoJsonProperties> =
  | G
  | Feature<G, P>
  | FeatureCollection<G, P>
