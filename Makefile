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
	$(MAKE) build
	docker-compose run next npx prisma migrate deploy
	docker-compose run next npx prisma generate
	$(MAKE) down
	$(MAKE) up

deploy_prod:
	ssh -A root@lite.stiolabs.com "cd ~/lite.stiolabs.com && git pull origin master && make prod"

%:
	docker-compose $(MAKECMDGOALS)