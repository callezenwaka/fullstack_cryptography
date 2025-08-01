#!/bin/bash

# setup-database.sh
# This script sets up the database for the full-stack cryptography demo environment.
echo "🚀 Setting up database..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
docker-compose exec -T postgres sh -c "until pg_isready -U crypto_user -d crypto_app; do sleep 1; done"
echo "✅ Database is ready"

# Function to run SQL file
run_sql_file() {
    local file_path=$1
    local description=$2
    
    if [ -f "$file_path" ]; then
        echo "📄 Running $description..."
        docker cp "$file_path" crypto_postgres:/tmp/temp.sql
        docker-compose exec -T postgres psql -U crypto_user -d crypto_app -f /tmp/temp.sql
        echo "✅ $description completed"
    else
        echo "⚠️  File not found: $file_path"
    fi
}

# Run migrations in order
echo "🗄️ Running migrations..."
run_sql_file "database/migrations/001_create_users.sql" "Users migration"
run_sql_file "database/migrations/002_create_transactions.sql" "Transactions migration"

# Run seeds
echo "🌱 Running seeds..."
run_sql_file "database/seeds/users.sql" "Users seed"
run_sql_file "database/seeds/transactions.sql" "Transactions seed"

# Verify setup
echo "🔍 Verifying setup..."
echo "📋 Tables:"
docker-compose exec -T postgres psql -U crypto_user -d crypto_app -c "\dt"

echo "👥 Users count:"
docker-compose exec -T postgres psql -U crypto_user -d crypto_app -c "SELECT COUNT(*) FROM users;"

echo "💳 Transactions count:" 
docker-compose exec -T postgres psql -U crypto_user -d crypto_app -c "SELECT COUNT(*) FROM transactions;"

echo "🎉 Database setup completed successfully!"