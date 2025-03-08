# SchedSync Infrastructure (Terraform)

[![Terraform](https://img.shields.io/badge/terraform-v1.11.1-blue)](https://www.terraform.io/)

## Overview
This repository manages the cloud infrastructure for **SchedSync** using **Terraform**. It provisions and maintains the following AWS resources:

- **API Gateway**: Provides a REST API endpoint for the application.
- **AWS Lambda**: Runs a containerized backend service (`schedsyncv2`) using **Amazon ECR**.
- **ECR Repository**: Stores and manages Docker images required for the Lambda function.

---

## Prerequisites
Before setting up, ensure you have the following installed:

1. **AWS CLI**: [Install & Configure](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) for authentication.
2. **Terraform**: [Download & Install](https://developer.hashicorp.com/terraform/downloads).
3. **Git**: [Install Git](https://git-scm.com/) for version control.

---

## Getting Started
### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/schedsync-terraform.git
cd schedsync-terraform
```

### **2. Initialize Terraform**
```bash
terraform init
```
This downloads required Terraform providers and sets up the working directory.

### **3. Preview Infrastructure Changes**
```bash
terraform plan
```
This command shows what resources will be created or updated without applying changes.

### **4. Deploy Infrastructure**
```bash
terraform apply
```
Type `yes` when prompted to confirm deployment. Terraform will create the necessary AWS resources.

---

## **Provisioned Resources**
| Resource Type       | Description                                     |
|---------------------|-----------------------------------------------|
| **API Gateway**     | Provides a REST API for SchedSync.             |
| **Lambda Function** | Runs the backend service in a containerized environment. |
| **ECR Repository**  | Stores and manages Docker images for deployment. |

---

## **Outputs**
After deployment, Terraform will display important output values:
```bash
Outputs:
api_gateway_url = "https://your-api-id.execute-api.us-east-1.amazonaws.com"
lambda_arn      = "arn:aws:lambda:us-east-1:your-account-id:function:schedsyncv2"
ecr_repo_url    = "your-account-id.dkr.ecr.us-east-1.amazonaws.com/schedsyncapi"
```

Use these values to interact with your deployed infrastructure.

---

## **Managing Infrastructure**
| Command                      | Description                                      |
|------------------------------|--------------------------------------------------|
| `terraform init`             | Initializes the Terraform project.               |
| `terraform plan`             | Shows proposed changes before applying.          |
| `terraform apply`            | Deploys infrastructure changes.                  |
| `terraform destroy`          | Destroys all resources (Use with caution).       |
| `terraform state list`       | Lists resources managed by Terraform.            |
| `terraform show`             | Displays the current Terraform state details.    |
| `terraform delete`           | Deletes a specific resource from the state.      |
| `terraform workspace list`   | Lists all available Terraform workspaces.        |
| `terraform workspace select <name>` | Switches to a specified workspace.    |
| `terraform workspace new <name>` | Creates a new workspace.               |
| `terraform state rm <resource>` | Removes a resource from the state file. |

---

## **Best Practices & Contribution Rules**
1. **Never commit secrets**: Store sensitive values in `terraform.tfvars`, which is ignored by Git.
2. **Format code**: Run `terraform fmt` before committing changes.
3. **Test before applying**: Always execute `terraform plan` to verify modifications.

### **Commit & Push Changes**
```bash
git commit -m "Add: your changes"
git push origin feature/your-feature-name
```
Then, create a **Pull Request** on GitHub to merge your changes.

---

## **Destroying Infrastructure (Optional)**
If you need to remove all provisioned resources, run:
```bash
terraform destroy
```
⚠️ **Warning**: This will permanently delete all infrastructure components.

---

## **Support**
If you encounter any issues, feel free to open an issue on the repository or reach out to the maintainers.

Happy Terraforming! 🚀

