-- Step 1: Temporarily allow NULL values
ALTER TABLE tasks ALTER COLUMN time DROP NOT NULL;

-- Step 2: Drop the existing column
ALTER TABLE tasks DROP COLUMN time;

-- Step 3: Add a new column with the correct type
ALTER TABLE tasks ADD COLUMN time TIMESTAMP(3);

-- Step 4: Restore the NOT NULL constraint
ALTER TABLE tasks ALTER COLUMN time SET NOT NULL;



-- I have done this migration MANUALLY because of inconsistencies