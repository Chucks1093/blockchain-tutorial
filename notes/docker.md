```ts
# Docker for Beginners

Docker is a platform that allows you to package your application and all its dependencies into a standardized unit called a **container**. Think of a container as a lightweight, standalone, executable package that includes everything needed to run your application.

## Why Docker Is Useful

1. **Consistency**: Your application runs the same way everywhere (your machine, test server, production)
2. **Isolation**: Applications don't interfere with each other
3. **Portability**: Run anywhere Docker is installed (Windows, Mac, Linux)
4. **Efficiency**: Uses fewer resources than virtual machines

## Key Docker Concepts

### Images
An **image** is like a snapshot or template. It contains:
- Operating system
- Software packages
- Application code
- Configuration

Images are read-only templates used to create containers.

### Containers
A **container** is a running instance of an image. Think of it like this:
- An image is like a class in programming
- A container is like an object created from that class

You can have multiple containers running from the same image.

### Docker Hub
**Docker Hub** is like GitHub for Docker images. It's a public repository where you can find pre-made images like Redis, PostgreSQL, Node.js, etc.

### docker-compose.yml
This file defines and runs multi-container Docker applications. It configures:
- Which images to use
- Environment variables
- Ports to expose
- Volumes for persistent storage
- Networks between containers

## Basic Docker Commands

### Running Your First Container
```bash
# Run a Redis container in the background
docker run -d --name my-redis -p 6379:6379 redis:alpine
```

This command:

- `-d`: Runs in the background (detached mode)
- `--name my-redis`: Names the container "my-redis"
- `-p 6379:6379`: Maps port 6379 on your computer to port 6379 in the container
- `redis:alpine`: The image to use (Redis with Alpine Linux)

### Managing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped ones)
docker ps -a

# Stop a container
docker stop my-redis

# Start a stopped container
docker start my-redis

# Remove a container (must be stopped first)
docker rm my-redis
```

### Using docker-compose

```bash
# Start services defined in docker-compose.yml
docker-compose up -d

# Stop services
docker-compose down

# See logs
docker-compose logs

# Rebuild if you change docker-compose.yml
docker-compose up -d --build
```

## Docker Compose for Redis

The docker-compose.yml I provided for Redis:

```yaml
version: '3.8'

services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    
  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  redis-data:
```

This does the following:

1. **Creates a Redis server**:
   - Based on the `redis:alpine` image
   - Accessible on port 6379
   - Data persists in a Docker volume named "redis-data"
   - Automatically restarts if it crashes

2. **Creates Redis Commander**:
   - A web UI for Redis
   - Accessible at <http://localhost:8081>
   - Only starts after Redis is running

## Getting Started

1. **Install Docker**:
   - Windows/Mac: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
   - Linux: Follow [installation instructions](https://docs.docker.com/engine/install/) for your distro

2. **Save the docker-compose.yml** to your project directory

3. **Start Redis**:

   ```bash
   docker-compose up -d
   ```

4. **Verify it's running**:

   ```bash
   docker ps
   ```

5. **Access the Redis Commander UI** at <http://localhost:8081>

## How It Works with Your Project

When you run `docker-compose up -d`, Docker will:

1. Download the Redis and Redis Commander images if needed
2. Create containers from these images
3. Set up a network between them
4. Start the containers
5. Make Redis available on localhost:6379

Your Node.js application connects to Redis at `localhost:6379` just as if Redis was installed directly on your machine, but with the benefits of isolation and easy setup/teardown.

```
