output "alb_dns_name" {
  description = "DNS name for the public load balancer"
  value       = aws_lb.app.dns_name
}

output "ecr_repository_url" {
  description = "URI of the ECR repository used by the service"
  value       = aws_ecr_repository.app.repository_url
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.app.name
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}
