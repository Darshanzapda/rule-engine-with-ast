# Use a lightweight Node.js image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the app on port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
