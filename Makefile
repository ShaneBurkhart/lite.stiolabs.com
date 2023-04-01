# /Makefile
.PHONY: build up down restart c logs ps

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart: down up logs

c:
	docker-compose run --rm $(or $(word 2, $(MAKECMDGOALS)), python) bash

logs:
	docker-compose logs -f $(or $(word 2, $(MAKECMDGOALS)),)

ps:
	docker-compose ps

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
	docker-compose $(MAKECMDGOALS)