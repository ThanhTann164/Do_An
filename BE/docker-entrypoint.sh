#!/bin/sh
set -e

echo "🚀 Starting backend container initialization..."

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
DB_HOST="${DB_HOST:-mysql}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-smarthome}"
DB_PORT="${DB_PORT:-3306}"

# Wait for MySQL with retry logic
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if mysqladmin ping -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" --silent 2>/dev/null; then
    echo "✅ MySQL is ready!"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   MySQL is unavailable - sleeping... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Failed to connect to MySQL after $MAX_RETRIES attempts"
  exit 1
fi

# Wait a bit more to ensure MySQL is fully initialized
echo "⏳ Waiting for MySQL to be fully initialized..."
sleep 5

# Function to check if database is empty
check_database_empty() {
  echo "🔍 Checking if database needs seeding..."
  
  # Try to connect and check if users table exists and has data
  node -e "
    const mysql = require('mysql2/promise');
    (async () => {
      try {
        const conn = await mysql.createConnection({
          host: process.env.DB_HOST || 'mysql',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'smarthome',
          port: parseInt(process.env.DB_PORT || '3306')
        });
        
        // Check if users table exists
        const [tables] = await conn.query(\`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = 'users'
        \`, [process.env.DB_NAME || 'smarthome']);
        
        if (tables[0].count === 0) {
          console.log('📋 Users table does not exist - database is empty');
          await conn.end();
          process.exit(1); // Empty
        }
        
        // Check if users table has any data
        const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
        const userCount = users[0]?.count || 0;
        
        await conn.end();
        
        if (userCount === 0) {
          console.log('📋 Users table is empty - database needs seeding');
          process.exit(1); // Empty
        } else {
          console.log(\`✅ Database already has \${userCount} user(s) - skipping seed\`);
          process.exit(0); // Not empty
        }
      } catch (error) {
        console.error('❌ Error checking database:', error.message);
        // If error, assume empty and try to seed
        try {
          if (typeof conn !== 'undefined') await conn.end();
        } catch (e) {}
        process.exit(1);
      }
    })();
  " 2>&1
  
  return $?
}

# Function to ensure database tables exist
ensure_tables() {
  echo "🔧 Ensuring database tables exist..."
  
  # Run ensurePackageTables if it exists
  if [ -f "database/migrations/ensurePackageTables.js" ]; then
    echo "   Running ensurePackageTables.js..."
    node database/migrations/ensurePackageTables.js || echo "⚠️  Warning: ensurePackageTables.js failed, continuing..."
  else
    echo "   ⚠️  ensurePackageTables.js not found, skipping..."
  fi
  
  # Run other table creation scripts if needed
  if [ -f "BE/scripts/createNotificationTable.js" ]; then
    echo "   Running createNotificationTable.js..."
    node BE/scripts/createNotificationTable.js || echo "⚠️  Warning: createNotificationTable.js failed"
  fi
  
  if [ -f "BE/scripts/createChatTables.js" ]; then
    echo "   Running createChatTables.js..."
    node BE/scripts/createChatTables.js || echo "⚠️  Warning: createChatTables.js failed"
  fi
}

# Function to seed database
seed_database() {
  echo "🌱 Seeding database with initial data..."
  
  # Run seed scripts
  if [ -f "BE/scripts/seedPackagesAndTestUsers.js" ]; then
    echo "   Running seedPackagesAndTestUsers.js..."
    node BE/scripts/seedPackagesAndTestUsers.js || {
      echo "❌ Error running seedPackagesAndTestUsers.js"
      exit 1
    }
  else
    echo "⚠️  Warning: seedPackagesAndTestUsers.js not found"
  fi
  
  if [ -f "BE/scripts/createAdmin.js" ]; then
    echo "   Running createAdmin.js..."
    node BE/scripts/createAdmin.js || {
      echo "⚠️  Warning: createAdmin.js failed (admin might already exist)"
    }
  else
    echo "⚠️  Warning: createAdmin.js not found"
  fi
  
  echo "✅ Database seeding completed!"
}

# Main initialization flow
main() {
  # Ensure tables exist first
  ensure_tables
  
  # Check if database is empty
  if check_database_empty; then
    echo "📦 Database is empty, running seed scripts..."
    seed_database
  else
    echo "✅ Database already has data, skipping seed"
  fi
  
  # Start the application
  echo "🚀 Starting Node.js application..."
  exec node BE/app.js
}

# Run main function
main

