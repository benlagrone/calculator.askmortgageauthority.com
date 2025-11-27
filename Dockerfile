   # Use the official Python image from the Docker Hub
   FROM python:3.9-slim

   # Set the working directory in the container
   WORKDIR /app

   # Copy the current directory contents into the container at /app
   COPY . /app

   # Install API/server dependencies
   RUN pip install --no-cache-dir fastapi uvicorn requests

   # Expose port 8000 to the outside world
   EXPOSE 8000

# Run a small SPA-friendly FastAPI server (serves index.html for unknown paths)
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]

   #   podman build -t my-simple-http-server .
   #   podman run -d -p 8000:8000 my-simple-http-server
   #   podman ps
   #   podman logs -f <container-id>
   #   podman stop <container-id>
   #   podman rm <container-id>
   #   podman rmi <image-id>
   #   podman images
   #   podman ps -a
   #   podman ps -a -q
   #   podman ps -a -q | xargs podman stop  
