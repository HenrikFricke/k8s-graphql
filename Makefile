IMAGE_NAME ?= k8s-graphql
VERSION ?= $(shell git rev-parse --short HEAD)
AWS_REGION ?= eu-central-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
ECR_URL ?= $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
ECR_IMAGE_URL ?=$(ECR_URL)/$(IMAGE_NAME):$(VERSION)
REGEX_ECR_IMAGE_URL ?=$(ECR_URL)\/$(IMAGE_NAME):$(VERSION)

build:
	docker build -t $(IMAGE_NAME) .

run: build
	docker run -it -p 8080:80 $(IMAGE_NAME)

login:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_URL)

tag:
	docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:$(VERSION)
	docker tag ${IMAGE_NAME}:$(VERSION) $(ECR_URL)/$(IMAGE_NAME):$(VERSION)

push: login build tag
	docker push $(ECR_URL)/$(IMAGE_NAME):$(VERSION)

deploy:
	cat kubernetes/deployment.yaml | \
		sed "s/{{IMAGE}}/$(REGEX_ECR_IMAGE_URL)/g" | \
		kubectl apply -f -
	kubectl apply -f kubernetes/service.yaml
	kubectl apply -f kubernetes/ingress.yaml

delete:
	cat kubernetes/deployment.yaml | \
		sed "s/{{IMAGE}}/$(REGEX_ECR_IMAGE_URL)/g" | \
		kubectl delete -f -
	kubectl delete -f kubernetes/service.yaml
	kubectl delete -f kubernetes/ingress.yaml