type LIST =
  | 'GET'
  | 'POST'
  | 'DELETE'
  | 'HEAD'
  | 'PATCH'
  | 'PUT'
  | 'OPTIONS'
  | 'TRACE'
  | 'CONNECT'

export type HttpMethod = LIST | Lowercase<LIST>
