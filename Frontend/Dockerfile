# Step 1: Use a small Node.js image
FROM node:20-alpine

# Step 2: Set the folder inside the container
WORKDIR /app

# Step 3: Copy the package.json and install dependencies
COPY package.json ./
RUN npm install

# Step 4: Copy the rest of your React code
COPY . .

# Step 5: Start the app
CMD ["npm", "run", "dev"]