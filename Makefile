IMAGE_NAME ?= k8s-graphql
VERSION ?= $(git rev-parse --short HEAD)
DOCKER_REGISTRY ?= 929113671861.dkr.ecr.eu-central-1.amazonaws.com
AWS_REGION ?= eu-central-1

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run -it -p 4000:4000 $(IMAGE_NAME)

login:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(DOCKER_REGISTRY)

tag:
	docker tag ${IMAGE_NAME}:$(VERSION) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION)

push: login build tag
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION