Steps to deploy on workers

First you need to set the env variables of the project
you need to run following cmd

set NEXT_PUBLIC_API_URL=https://api.schedsync.com

and run the following cmd

npx wrangler deploy --env production
npm run build
npm run preview
