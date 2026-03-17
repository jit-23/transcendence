DC=docker-compose
build:
	$(DC) build
up:
	$(DC) up -d
up-frontend:
	$(DC) up -d frontend_server
up-backend:
	$(DC) up -d backend_server
stop:
	$(DC) down
stop-frontend:
	$(DC) stop frontend_server
stop-backend:
	$(DC) stop backend_server
clean:
	-docker compose down --rmi all --volumes --remove-orphans
logs:
	$(DC) logs -f
logs-frontend:
	$(DC) logs -f frontend_server
logs-backend:
	$(DC) logs -f backend_server
exec-backend:
	$(DC) exec backend_server sh
exec-frontend:
	$(DC) exec frontend_server sh
help:
	@echo "make build           Build all images"
	@echo "make up              Start all services"
	@echo "make stop            Stop all services"
	@echo "make clean           Remove containers, images, volumes"
	@echo "make logs            Show logs for all services"
	@echo "make exec-backend    Exec into backend container"
	@echo "make exec-frontend   Exec into frontend container"