# variables.tf

# Sensitive variables (API keys, credentials, etc.)
variable "client_url" {
  description = "Client URL for the application"
  type        = string
  sensitive   = false  # Non-sensitive (public URL)
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "deepseek_api_key" {
  description = "DeepSeek API Key"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini API Key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret Key"
  type        = string
  sensitive   = true
}

variable "node_api_url" {
  description = "Node.js API URL"
  type        = string
  sensitive   = false  # Non-sensitive (public endpoint)
}

variable "node_env" {
  description = "Node.js environment (e.g., production)"
  type        = string
  sensitive   = false
}

variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}

variable "pinecone_api_key" {
  description = "Pinecone API Key"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection URL"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Session Secret Key"
  type        = string
  sensitive   = true
}