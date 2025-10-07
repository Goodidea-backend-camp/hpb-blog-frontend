export interface User {
  id: number
  username: string
  created_at: string
  updated_at: string
}

export interface AuthorInfo {
  id: number
  username: string
}

export interface Article {
  id: number
  author: AuthorInfo
  title: string
  slug: string
  content: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface NewArticle {
  title: string
  content: string
  slug?: string
  published_at?: string | null
}

export interface UpdateArticle {
  title?: string
  content?: string
  slug?: string
  published_at?: string | null
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ErrorResponse {
  code: number
  message: string
}
