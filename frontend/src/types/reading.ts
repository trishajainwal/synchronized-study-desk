export interface ReadingPositionUpdate {
  document_id: string
  page_number: number
  origin_device_id: string
}

export interface ReadingPositionRead {
  id: string
  session_id: string
  document_id: string
  page_number: number
  updated_at: string
}
