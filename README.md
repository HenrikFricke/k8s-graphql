# k8s-graphql

Simple repository to play around with Kubernetes and deploying a simple Apollo Server. This project does not provide any CI/CD workflows.

## Development

Make sure you have Node.js running on your machine.

```sh
git clone git@github.com:henrikfricke/k8s-graphql
cd k8s-graphql

# Install dependencies
npm i

# Start server
# Go to http://localhost:4000
npm start
```

## Deployment

Assuming you have an AWS EKS cluster running with [ALB Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/) in place. I used this [sample](https://github.com/rimaulana/eks-fargate-alb-ingress-sample) to get things bootstrapped. To run the Makefile tasks, you need to have AWS credentials in your terminal plus a valid Kubeconfig to access the EKS cluster.

You also need to create a repository called `k8s-graphql` in AWS ECR.

```sh
# Pushes a new docker image to AWS ECR tagged with the current commit hash
make push

# Applies the deployment, service, and ingress to the cluster
make deploy
```