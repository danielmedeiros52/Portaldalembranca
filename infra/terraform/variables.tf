variable "aws_region" {
  description = "AWS region used for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Logical name used as prefix for resources"
  type        = string
  default     = "portal-da-lembranca"
}

variable "environment" {
  description = "Deployment environment label (e.g. dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "container_image" {
  description = "Full image URI (including tag) to deploy on ECS"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the application container"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "CPU units for the task definition"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory (MiB) for the task definition"
  type        = number
  default     = 1024
}

variable "health_check_path" {
  description = "Path ALB uses for health checks"
  type        = string
  default     = "/"
}

variable "application_environment" {
  description = "Plaintext environment variables injected into the container"
  type        = map(string)
  default     = {}
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "allowed_ingress_cidrs" {
  description = "CIDR blocks allowed to reach the load balancer"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
