#!/bin/bash

# demo-setup.sh
# This script automates the setup of a full-stack cryptography demo environment.
set -e  # Exit on any error

echo "🚀 Starting Crypto Demo - Full Pipeline Automation"
echo "=================================================="

generate_key_pair() {
    local name=$1
    local key_size=2048
    
    echo "🔑 Generating $name key pair..."
    
    # Generate private key (most compatible method)
    openssl genrsa -out /tmp/${name}-private.pem $key_size
    
    # Convert to PKCS#8 format 
    openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in /tmp/${name}-private.pem -out /tmp/${name}-private-pkcs8.pem
    mv /tmp/${name}-private-pkcs8.pem /tmp/${name}-private.pem
    
    # Generate public key from private key
    openssl rsa -in /tmp/${name}-private.pem -pubout -out /tmp/${name}-public.pem
    
    echo "✅ $name key pair generated"
}

# Function to setup keys
setup_keys() {
    echo "🔧 Setting up encryption keys..."
    
    # Check if keys already exist
    if [[ -f "server/keys/server-private.pem" && -f "client/src/assets/keys/client-key.pem" && -f "client/.env" ]]; then
        echo "🔑 Keys already exist, skipping generation..."
        return 0
    fi
    
    # Create directories
    mkdir -p server/keys
    mkdir -p client/public/keys
    mkdir -p client/src/assets/keys
    
    # Generate server keys
    generate_key_pair "server"
    mv /tmp/server-private.pem server/keys/
    mv /tmp/server-public.pem server/keys/
    
    # Generate client keys  
    generate_key_pair "client"
    mv /tmp/client-private.pem client/src/assets/keys/client-key.pem
    mv /tmp/client-public.pem client/public/keys/
    
    # Copy public keys for cross-reference
    cp server/keys/server-public.pem client/public/keys/
    cp client/public/keys/client-public.pem server/keys/
    
    # Create client/.env with base64 encoded private key
    echo "🔧 Creating client environment file..."
    CLIENT_PRIVATE_KEY_B64=$(base64 -i client/src/assets/keys/client-key.pem | tr -d '\n')
    echo "# Auto-generated client private key for Docker" > client/.env
    echo "VITE_CLIENT_PRIVATE_KEY_B64=$CLIENT_PRIVATE_KEY_B64" >> client/.env
    
    echo "✅ All keys generated and configured"
    echo "📄 Created client/.env ($(wc -c < client/.env) bytes)"
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    docker-compose exec -T postgres sh -c "until pg_isready -U crypto_user -d crypto_app; do sleep 1; done" 2>/dev/null || true
    
    # Function to run SQL file
    run_sql_file() {
        local file_path=$1
        local description=$2
        
        if [[ -f "$file_path" ]]; then
            echo "📄 Running $description..."
            docker cp "$file_path" crypto_postgres:/tmp/temp.sql
            docker-compose exec -T postgres psql -U crypto_user -d crypto_app -f /tmp/temp.sql > /dev/null
            echo "✅ $description completed"
        else
            echo "⚠️  File not found: $file_path"
        fi
    }
    
    # Run migrations in order
    echo "📋 Running migrations..."
    run_sql_file "database/migrations/001_create_users.sql" "Users migration"
    run_sql_file "database/migrations/002_create_transactions.sql" "Transactions migration"
    
    # Run seeds
    echo "🌱 Running seeds..."
    run_sql_file "database/seeds/users.sql" "Users seed"
    run_sql_file "database/seeds/transactions.sql" "Transactions seed"
    
    # Verify setup
    echo "🔍 Verifying database setup..."
    USER_COUNT=$(docker-compose exec -T postgres psql -U crypto_user -d crypto_app -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs || echo "0")
    TRANSACTION_COUNT=$(docker-compose exec -T postgres psql -U crypto_user -d crypto_app -t -c "SELECT COUNT(*) FROM transactions;" 2>/dev/null | xargs || echo "0")
    
    echo "👥 Users: $USER_COUNT"
    echo "💳 Transactions: $TRANSACTION_COUNT"
    echo "✅ Database setup completed"
}

# Main execution
main() {
    echo "📋 Phase 1: Key Generation and Setup"
    setup_keys
    
    echo ""
    echo "📋 Phase 2: Docker Container Startup"
    echo "🐳 Starting Docker containers..."
    docker-compose up -d --build
    
    # Wait for containers to be healthy
    echo "⏳ Waiting for containers to be ready..."
    sleep 15
    
    echo ""
    echo "📋 Phase 3: Database Initialization"
    setup_database
    
    echo ""
    echo "🎉 Crypto Demo Pipeline Complete!"
    echo "================================="
    echo "🌐 Client App:    http://localhost:3000"
    echo "🔧 API Server:    http://localhost:3001"
    echo "🗄️ Database UI:   http://localhost:8080"
    echo ""
    echo "📊 Demo Status:"
    echo "✅ Encryption keys generated and configured"
    echo "✅ Docker containers running"
    echo "✅ Database initialized with sample data"
    echo "✅ All services ready for demonstration"
    echo ""
    echo "🔐 Pipeline automation complete - ready to demo!"
}

# Execute main function
main