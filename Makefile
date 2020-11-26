IMAGE_NAME ?= k8s-graphql
VERSION ?= $(shell git rev-parse --short HEAD)

AWS_REGION ?= eu-central-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
ECR_URL ?= $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run -it -p 4000:4000 $(IMAGE_NAME)

login:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_URL)

tag:
	docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:$(VERSION)
	docker tag ${IMAGE_NAME}:$(VERSION) $(ECR_URL)/$(IMAGE_NAME):$(VERSION)

push: login build tag
	docker push $(ECR_URL)/$(IMAGE_NAME):$(VERSION)