# Use AWS Lambda Node.js 22 base image
FROM public.ecr.aws/lambda/nodejs:22

# Set the working directory
WORKDIR /var/task

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies (including TypeScript)
RUN npm install

# Copy Prisma schema and generate the client
COPY prisma ./prisma
RUN npx prisma generate

# Copy TypeScript config (needed for compilation)
COPY tsconfig.json ./

# Copy source files and compile TypeScript
COPY src ./src
RUN npx tsc

# Copy compiled JS files (ONLY compiled output)
COPY dist ./dist

# Set the Lambda handler
CMD ["dist/index.handler"]


