# 🔐 Crypto Demo - Essential Guide

## 🚀 Quick Start

```bash
# Start everything
npm run demo:start
```

**Demo URLs:**
- 🌐 **Client**: http://localhost:3000
- 🔧 **API**: http://localhost:3001  
- 🗄️ **Database**: http://localhost:8080 (admin@example.com / admin123)

## ⚡ Essential Commands

### **Demo Control:**
```bash
npm run demo:start          # Start demo
npm run demo:stop           # Stop demo
npm run demo:clean          # Stop + clean all data
npm run demo:logs           # View logs
```

### **Verification:**
```bash
npm run verify              # Check setup status
```

## 🔍 Verify Demo Works

### **Check Services:**
```bash
docker ps                   # All containers running
npm run demo:logs          # No error messages
```

### **Test Endpoints:**
```bash
curl http://localhost:3001/keys/client-public.pem
curl http://localhost:3001/keys/server-public.pem
```

### **Test App:**
- Open http://localhost:3000
- Create a transaction
- Check browser console for encryption messages
- View encrypted data in pgAdmin

## 🐛 Quick Fixes

### **Containers Not Starting:**
```bash
docker-compose down -v
docker-compose up --build
docker exec -it crypto_postgres psql -U crypto_user -d crypto_app
docker-compose exec postgres psql -U crypto_user -d crypto_app
```

### **Port Conflicts:**
```bash
lsof -i :3000 :3001 :5432    # Check busy ports
```

### **Key Issues:**
```bash
npm run setup-keys          # Regenerate keys
```

## 🎪 Demo Flow

1. **Start**: `npm run demo:start`
2. **Show Client**: Create encrypted transactions at http://localhost:3000
3. **Show Console**: Watch encryption/decryption logs
4. **Show Database**: View encrypted data at http://localhost:8080
5. **Show API**: Test endpoints with curl
6. **Clean Up**: `npm run demo:clean`

## 🎯 What You Get

- **Full-stack encryption** with RSA + AES hybrid
- **Real database** with PostgreSQL
- **Docker environment** with all services
- **Key management** with automatic setup
- **Audit trail** in browser console and server logs

---

**Ready to demo:**
```bash
npm run demo:start
```