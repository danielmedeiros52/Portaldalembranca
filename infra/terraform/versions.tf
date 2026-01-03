terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.65"
    }
  }

  # Configure your backend here (S3/DynamoDB) before running in a team setting.
  # backend "s3" {}
}

provider "aws" {
  region = var.aws_region
}
