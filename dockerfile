# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy .env file to the working directory
COPY .env .

# Set environment variables from .env file
ENV $(cat .env | xargs)

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the SvelteKit app
RUN npm run build

# Set the command to run the app when the container starts
CMD ["node", "build"]

# Expose the port that the app will run on
EXPOSE 8082