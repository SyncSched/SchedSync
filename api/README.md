# Migrations Guide

## Creating a New Migration
To create a new migration, use the following command:
```bash
npm run migration:create
```

## Applying Migrations (Development)
To execute the latest migrations in your development environment, use:
```bash
npm run migrate
```

## Reverting the Last Migration
There is no direct command to revert a migration. However, you can manually create a new migration to undo the changes:
1. Edit the `schema.prisma` file and remove or adjust the changes you want to revert.
2. Run the following command to create the revert migration:
   ```bash
   npm run migration:create
   ```
3. Apply the revert migration:
   ```bash
   npm run migrate
   ```

## Applying Migrations in Production
To deploy migrations in a production environment, use:
```bash
npm run migrate:production
```

## Important Alert
Whenever you create an SQL command, **never unnecessarily drop tables or columns**, or else the migrations in production may fail.

## Troubleshooting Production Migration Issues
If migrations in production don’t work:
1. Manually run the specific migration SQL command via:
   ```bash
   psql db_url_in_env_production
   ```
2. Navigate to the `prisma_migrations` table in the database and update the particular migration manually.

