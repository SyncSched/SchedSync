# outputs.tf

output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_rest_api.schedsyncapi.execution_arn
}

output "lambda_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.schedsyncv2.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.schedsyncapi.repository_url
}