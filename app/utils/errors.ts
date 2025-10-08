export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown,
    public code?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
