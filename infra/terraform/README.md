# Deploying to AWS with Terraform

These files provision the resources needed to run the Portal da Lembrança container on AWS using ECS Fargate behind an Application Load Balancer. The stack creates:

- A VPC with two public subnets (no NAT gateway to keep costs low).
- An ECR repository to store the application image.
- An ECS cluster, task definition, and service with a public load balancer.
- CloudWatch logging for the container.

## Prerequisites
- Terraform 1.8+
- AWS credentials configured locally (IAM user or role with permissions for ECS, ECR, EC2, IAM, and VPC).
- Docker for building images.
- Access to the application environment variables (database URL, JWT secret, etc.).

## Usage

1. **Create a working directory**
   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # edit terraform.tfvars with your AWS account details
   ```

2. **Initialize Terraform**
   ```bash
   terraform init
   ```

3. **Plan and apply**
   ```bash
   terraform plan
   terraform apply
   ```
   On apply Terraform will output the load balancer DNS name you can use to reach the app.

4. **Build and push the Docker image**
   ```bash
   # From the repository root
   docker build -t portal-da-lembranca:latest .

   # Authenticate to ECR (example for us-east-1)
   aws ecr get-login-password --region us-east-1 \
     | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Tag and push using the repository URL from Terraform outputs
   docker tag portal-da-lembranca:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/portal-da-lembranca-prod:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/portal-da-lembranca-prod:latest
   ```

5. **Update the service**
   If you push a new image tag, update `container_image` in `terraform.tfvars` and run `terraform apply` again so the ECS service picks up the change.

## Notes
- The service assigns public IPs to Fargate tasks and exposes port 80 through the Application Load Balancer.
- Add secrets through AWS Systems Manager Parameter Store or Secrets Manager if you prefer not to store them in `terraform.tfvars`; adjust the task definition accordingly.
- Configure an S3/DynamoDB backend in `versions.tf` before collaborating to avoid state drift.
