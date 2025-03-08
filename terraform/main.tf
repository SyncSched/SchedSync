provider "aws" {
  region = "us-east-1"  # Match your AWS region
}

# -----------------------------------------------------------------------------
# API Gateway REST API
# -----------------------------------------------------------------------------
resource "aws_api_gateway_rest_api" "schedsyncapi" {
  name        = "schedsyncapi-API"
  description = "Created by AWS Lambda"
  endpoint_configuration {
    types = ["REGIONAL"]
  }
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = "*",
      Action    = "execute-api:Invoke",
      Resource  = "arn:aws:execute-api:us-east-1:908027384571:jtxg13v8e1/*"
    }]
  })
}

# -----------------------------------------------------------------------------
# ECR Repository
# -----------------------------------------------------------------------------
resource "aws_ecr_repository" "schedsyncapi" {
  name                 = "schedsyncapi"
  image_tag_mutability = "MUTABLE"
  encryption_configuration {
    encryption_type = "AES256"
  }
  image_scanning_configuration {
    scan_on_push = false
  }
}

# -----------------------------------------------------------------------------
# Lambda Function
# -----------------------------------------------------------------------------
resource "aws_lambda_function" "schedsyncv2" {
  function_name = "schedsyncv2"
  role          = "arn:aws:iam::908027384571:role/service-role/schedsyncv2-role-7rkfzlmu"  # Existing IAM role ARN
  package_type  = "Image"
  image_uri     = "908027384571.dkr.ecr.us-east-1.amazonaws.com/schedsyncapi:latest"
  architectures = ["x86_64"]
  timeout       = 20
  memory_size   = 128

  # Environment variables (from your state)
  environment {
    variables = {
      CLIENT_URL          = var.client_url
      DATABASE_URL        = var.database_url
      DEEPSEEK_API_KEY    = var.deepseek_api_key
      GEMINI_API_KEY      = var.gemini_api_key
      GOOGLE_CLIENT_ID    = var.google_client_id
      GOOGLE_CLIENT_SECRET = var.google_client_secret
      JWT_SECRET          = var.jwt_secret
      NODE_API_URL        = var.node_api_url
      NODE_ENV            = var.node_env
      OPENAI_API_KEY      = var.openai_api_key
      PINECONE_API_KEY    = var.pinecone_api_key
      REDIS_URL           = var.redis_url
      SESSION_SECRET      = var.session_secret
    }
  }

  # Logging configuration
  logging_config {
    log_format       = "Text"
    log_group        = "/aws/lambda/schedsyncv2"
  }

  # Ephemeral storage
  ephemeral_storage {
    size = 512
  }
}

# -----------------------------------------------------------------------------
# IAM Role (Optional: Only if you want to manage it with Terraform)
# -----------------------------------------------------------------------------
data "aws_iam_role" "lambda_exec" {
  name = "schedsyncv2-role-7rkfzlmu"  
}