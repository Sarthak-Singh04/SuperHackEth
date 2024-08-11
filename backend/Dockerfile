# Use the official Bun image
FROM oven/bun:1

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the app with hot-reloading for development
CMD ["bun", "run", "--hot", "src/index.ts"]
