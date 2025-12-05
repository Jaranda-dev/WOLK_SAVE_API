import { DateTime } from 'luxon'

export type EvidenceType = 'photo' | 'audio'
export type PlaceType = 'routepoints' | 'incident' | 'desviation'

export interface Contact {
  id: number
  phone: string
  email: string
  name: string
  direction: string
  userId: number
  user?: User | null
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

export interface Evidence {
  id: number
  fileType: string
  fileName?: string | null
  fileSize?: number | null
  path: string
  incidentId: number
  incident?: Incident | null
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

export interface Incident {
  id: number
  date: DateTime
  placeId: number
  routeRunId: number
  place?: Place | null
  routeRun?: RouteRun | null
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

export interface Place {
  id: number
  lat: number
  long: number
  name: string
  type: PlaceType
  incidents?: Incident[]
  startRoutes?: Route[]
  endRoutes?: Route[]
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

// Note: Report model removed — evidences are attached to incidents now.

export interface Role {
  id: number
  name: string
  description: string
  users?: User[]
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

export interface Route {
  id: number
  userId: number
  startPlaceId: number
  endPlaceId: number
  user?: User | null
  startPlace?: Place | null
  endPlace?: Place | null
  runs?: RouteRun[]
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

export interface RouteRun {
  id: number
  routeId: number
  userId: number
  startTime: DateTime
  endTime: DateTime
  route?: Route | null
  user?: User | null
  incidents?: Incident[]
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}

export interface User {
  id: number
  name: string
  roleId: number
  email: string
  password?: string
  rememberMeToken?: string | null
  role?: Role | null
  contacts?: Contact[]
  routes?: Route[]
  routeRuns?: RouteRun[]
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime | null
}
