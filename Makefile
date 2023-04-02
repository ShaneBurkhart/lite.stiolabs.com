# /Makefile
.PHONY: build up down restart c logs ps

DOCKER_COMPOSE_SETTINGS = -f docker-compose.yaml -f ./monorepo/docker-compose.yaml
COMPOSE = docker-compose $(DOCKER_COMPOSE_SETTINGS)

all: build

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart: down up logs

c:
	$(COMPOSE) run --rm $(or $(word 2, $(MAKECMDGOALS)), python) bash

logs:
	$(COMPOSE) logs -f $(or $(word 2, $(MAKECMDGOALS)),)

ps:
	$(COMPOSE) ps

npm_install:
	$(COMPOSE) run --rm next npm install
	$(COMPOSE) run --rm monorepo npm install

migrate:
	$(COMPOSE) run next npx prisma migrate dev
	$(COMPOSE) run next npx prisma generate

dev_certs:
	$(COMPOSE) down

	docker run -it --rm \
		-v $(shell pwd)/data/letsencrypt:/etc/letsencrypt \
		-v $(shell pwd)/data/letsencrypt/lib:/var/lib/letsencrypt \
		certbot/certbot \
		certonly \
		--manual \
		--preferred-challenges dns \
		--email shaneburkhart@gmail.com \
		--agree-tos \
		--no-eff-email \
		--manual-public-ip-logging-ok \
		-d '*.shane.stiolabs.com' \
		-d 'shane.stiolabs.com'


	# $(COMPOSE) run --rm proxy certbot certonly --standalone -d shane.shaneburkhart.com -d *.shane.shaneburkhart.com

prod:
	echo "Running in production mode"
	docker-compose -f docker-compose.prod.yaml build
	docker-compose -f docker-compose.prod.yaml run next npx prisma migrate deploy
	docker-compose -f docker-compose.prod.yaml run next npx prisma generate
	docker-compose -f docker-compose.prod.yaml down
	docker-compose -f docker-compose.prod.yaml up -d

deploy_prod:
	ssh -A root@lite.stiolabs.com "cd ~/lite.stiolabs.com && git pull origin master && make prod"

%:
	echo "Running make command: $(MAKECMDGOALS)"
	$(COMPOSE) $(MAKECMDGOALS)

include ./monorepo/Makefile