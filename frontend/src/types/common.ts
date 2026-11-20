export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface ValidationErrorItem {
  loc: Array<string | number>
  msg: string
  type: string
}

export interface ApiErrorBody {
  detail?: string | ValidationErrorItem[]
}
