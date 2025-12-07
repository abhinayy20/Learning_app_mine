# Lab 1: Deploy Infrastructure with Terraform

**Estimated Time**: 30-45 minutes  
**Difficulty**: Intermediate  
**Prerequisites**: AWS account, Terraform installed

## Learning Objectives

By the end of this lab, you will be able to:
- Understand Terraform modules and their benefits
- Provision a production-grade AWS VPC
- Deploy an Amazon EKS cluster
- Configure IAM roles for Kubernetes (IRSA)

## Lab Setup

1. Ensure prerequisites are met:
   ```bash
   aws --version
   terraform --version
   kubectl version --client
   ```

2. Clone the repository:
   ```bash
   git clone <repo-url>
   cd LEARNING_PROJECT/infrastructure/terraform/environments/dev
   ```

## Step 1: Review Terraform Configuration

### Task 1.1: Understand the Project Structure

Explore the Terraform directory structure:
```bash
tree ../../
```

**Questions**:
1. What are the three modules used in this project?
2. Why use modules instead of putting everything in one file?

### Task 1.2: Review Variables

Open `variables.tf` and identify:
- Default AWS region
- EKS cluster version
- Node instance types
- Min/max node counts

**Exercise**: Modify `eks_node_desired_size` to 3 (from 2)

## Step 2: Initialize Terraform

Run Terraform initialization:
```bash
terraform init
```

**Observe**:
- Provider downloads
- Module initialization
- Backend configuration

**Questions**:
1. Which AWS provider version is being used?
2. What happens if you run `terraform init` again?

## Step 3: Plan Infrastructure Changes

Generate an execution plan:
```bash
terraform plan -out=tfplan
```

**Exercise**: Count the resources that will be created:
- How many subnets?
- How many security groups?
- What type of NAT gateway setup?

**Expected Resources**:
- VPC: 1
- Subnets: 6 (3 public + 3 private)
- NAT Gateways: 1 (cost optimization)
- EKS Cluster: 1
- Node Group: 1
- IAM Roles: 6+

## Step 4: Apply Configuration

Deploy the infrastructure:
```bash
terraform apply tfplan
```

⏱️ **Wait time**: 15-20 minutes (EKS cluster creation)

**Monitoring**:
```bash
# In another terminal, watch AWS console:
# - EC2 Dashboard for instances
# - VPC Dashboard for networking
# - EKS Dashboard for cluster
```

## Step 5: Verify Infrastructure

### Task 5.1: Check Terraform Outputs

```bash
terraform output
```

**Save for later**:
```bash
terraform output > ../../../../terraform-outputs.txt
```

### Task 5.2: Configure kubectl

```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name learning-platform-dev-eks

kubectl get nodes
```

**Expected Output**:
```
NAME                            STATUS   ROLES    AGE   VERSION
ip-10-0-100-x.ec2.internal     Ready    <none>   5m    v1.28.x
ip-10-0-101-x.ec2.internal     Ready    <none>   5m    v1.28.x
```

### Task 5.3: Explore the Cluster

```bash
# Check namespaces
kubectl get namespaces

# Check pods in kube-system
kubectl get pods -n kube-system

# Check nodes in detail
kubectl describe node <NODE_NAME>
```

## Step 6: Understand VPC Configuration

### Task 6.1: Verify VPC Setup

```bash
# Get VPC ID
export VPC_ID=$(terraform output -raw vpc_id)

# View VPC in AWS CLI
aws ec2 describe-vpcs --vpc-ids $VPC_ID

# List subnets
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[*].[SubnetId,CidrBlock,AvailabilityZone,Tags[?Key==`Name`].Value|[0]]' \
  --output table
```

**Questions**:
1. Which subnets are tagged for EKS?
2. What CIDR blocks are used?
3. Why are there 3 of each subnet type?

### Task 6.2: Check NAT Gateway

```bash
aws ec2 describe-nat-gateways \
  --filter "Name=vpc-id,Values=$VPC_ID"
```

**Questions**:
1. How many NAT Gateways exist?
2. In which subnet is it located?
3. What is the trade-off of using a single NAT Gateway?

## Step 7: Understand IAM Roles for Service Accounts (IRSA)

### Task 7.1: Verify OIDC Provider

```bash
# Get OIDC provider ARN
terraform output oidc_provider_arn

# List OIDC providers
aws iam list-open-id-connect-providers
```

### Task 7.2: Check IAM Roles

```bash
# List roles created for Kubernetes
aws iam list-roles \
  --query 'Roles[?contains(RoleName, `learning-platform-dev`)].RoleName'
```

**Expected Roles**:
- Cluster role
- Node group role
- AWS Load Balancer Controller role
- External DNS role
- Cert Manager role
- Cluster Autoscaler role

## Step 8: Explore Terraform State

```bash
# List all resources in state
terraform state list

# Show details of a specific resource
terraform state show module.vpc.aws_vpc.main

# Show EKS cluster details
terraform state show module.eks.aws_eks_cluster.main
```

**Questions**:
1. Where is the Terraform state stored?
2. What would happen if you deleted the state file?
3. How can we secure the state file? (Hint: Check commented S3 backend in `provider.tf`)

## Challenge Tasks

### Challenge 1: Cost Optimization (Easy)

Modify the configuration to use even smaller instances:
- Change `eks_node_instance_types` to `["t3.small"]`
- Reduce `eks_node_desired_size` to 1
- Apply changes

**Warning**: This may impact performance!

### Challenge 2: High Availability (Medium)

Modify for true HA setup:
- Set `single_nat_gateway = false` in `variables.tf`
- This creates a NAT Gateway in each AZ
- Understand cost implications

**Question**: How much extra would this cost per month?

### Challenge 3: Enable S3 Backend (Advanced)

1. Create S3 bucket for state:
   ```bash
   aws s3api create-bucket \
     --bucket learning-platform-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
     --region us-east-1
   
   aws s3api put-bucket-versioning \
     --bucket learning-platform-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
     --versioning-configuration Status=Enabled
   ```

2. Create DynamoDB table for locking:
   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

3. Uncomment the S3 backend in `provider.tf`

4. Run `terraform init -migrate-state`

## Cleanup

**Important**: To avoid AWS charges:

```bash
# Destroy infrastructure
terraform destroy -auto-approve
```

⏱️ **Wait time**: 10-15 minutes

**Verify deletion**:
```bash
# Check VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=learning-platform-dev-vpc"

# Check EKS
aws eks list-clusters
```

## Lab Questions & Answers

1. **Q**: What is the purpose of the OIDC provider?  
   **A**: Enables IAM Roles for Service Accounts (IRSA), allowing pods to assume AWS IAM roles without AWS credentials.

2. **Q**: Why use private subnets for EKS nodes?  
   **A**: Security best practice - nodes don't need public IPs, NAT gateway handles outbound traffic.

3. **Q**: What does the cluster autoscaler do?  
   **A**: Automatically adjusts the number of nodes based on pod resource requests.

4. **Q**: How much does this infrastructure cost per month?  
   **A**: ~$150-200 (EKS control plane $73 + 2x t3.medium instances ~$60-80 + NAT Gateway ~$32 + data transfer)

## Further Reading

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Amazon EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform Modules](https://developer.hashicorp.com/terraform/language/modules)
- [AWS VPC Design](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html)

## Next Lab

**Lab 2**: Build and Push Docker Images → Learn containerization best practices

---

**Completion Checklist**:
- [ ] Infrastructure deployed successfully
- [ ] kubectl configured and working
- [ ] VPC and subnets verified
- [ ] IAM roles understood
- [ ] At least one challenge completed
- [ ] Infrastructure destroyed to avoid charges

**Congratulations! 🎉** You've deployed production-grade AWS infrastructure with Infrastructure as Code!
