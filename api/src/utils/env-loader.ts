import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV === 'production') {
  console.log('Loading production environment...');
  dotenv.config({ path: '.env.production' });
} else {
  console.log('Loading development environment...');
  dotenv.config({ path: '.env.development' });
}

// Export environment check helper
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV !== 'production';
