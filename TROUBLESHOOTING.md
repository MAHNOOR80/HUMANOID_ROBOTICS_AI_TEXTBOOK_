# Backend Connection Troubleshooting Guide

## Issue
Frontend chatbot not connecting to Railway backend, showing error: "Server error: The service is temporarily unavailable"

## Solution Steps

### 1. **Restart Your Development Server** (IMPORTANT!)
The configuration changes require a restart to take effect.

```bash
cd my-book

# Stop the current server (Ctrl+C or Cmd+C)
# Then restart:
npm run start
```

### 2. **Verify Backend is Running**
Open this URL in your browser:
```
https://backend-production-e37e.up.railway.app/health
```

You should see:
```json
{
  "status": "healthy",
  "services": {
    "qdrant": "connected",
    "llm": "available"
  }
}
```

### 3. **Test Backend Connection Directly**
Open the test file in your browser:
```
test_backend_connection.html
```

This will:
- Test the health endpoint
- Test the query endpoint
- Show detailed error messages
- Help identify CORS or network issues

### 4. **Check Browser Console**
1. Open your frontend in the browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Look for the log message: `🔗 API Base URL: https://backend-production-e37e.up.railway.app`
5. Check for any error messages (red text)

### 5. **Common Issues and Solutions**

#### Issue: API URL still shows localhost
**Solution:** You haven't restarted the dev server. Stop and restart it.

#### Issue: CORS Error in Console
**Error message:** `Access to fetch at 'https://backend-production-e37e.up.railway.app' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:** Update Railway backend environment variables:
1. Go to your Railway project dashboard
2. Go to Variables tab
3. Add/update:
   ```
   FRONTEND_URL=http://localhost:3000
   ```
4. For production, also add your Vercel URL:
   ```
   FRONTEND_URL=https://physical-ai-humanoid-robotics-textb-dun.vercel.app
   ```

Note: The backend defaults to allowing all origins (*), but if you've set FRONTEND_URL explicitly, make sure it includes your frontend URL.

#### Issue: Network Error or Unable to Connect
**Possible causes:**
1. Railway backend is down (check Railway dashboard)
2. Network/firewall blocking the connection
3. Invalid URL

**Solution:**
1. Check Railway dashboard to ensure backend is running
2. Test the health endpoint directly
3. Check Railway logs for errors

#### Issue: Backend Returns 500 Error
**Solution:**
1. Check Railway logs for the actual error
2. Common causes:
   - Missing environment variables (OPENAI_API_KEY, COHERE_API_KEY, QDRANT_URL)
   - Qdrant connection issues
   - LLM API issues

### 6. **Verify Railway Environment Variables**
Make sure these are set in your Railway backend:

Required:
- `OPENAI_API_KEY` - Your OpenAI/Google API key
- `COHERE_API_KEY` - Your Cohere API key
- `QDRANT_URL` - Your Qdrant database URL
- `QDRANT_API_KEY` - Your Qdrant API key

Optional:
- `FRONTEND_URL` - Your frontend URL (defaults to allowing all origins)

### 7. **Test with CURL (Advanced)**

Test health endpoint:
```bash
curl https://backend-production-e37e.up.railway.app/health
```

Test query endpoint:
```bash
curl -X POST https://backend-production-e37e.up.railway.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "text": "What is humanoid robotics?",
    "mode": "full_book"
  }'
```

### 8. **Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to send a query
4. Look for the request to `/api/query`
5. Check:
   - Status code (should be 200)
   - Request URL (should point to Railway)
   - Response (check for errors)

## Updated Files
The following files have been updated to use the Railway backend:

1. `my-book/docusaurus.config.ts` - Updated default API URL
2. `my-book/src/services/config.ts` - Added debug logging
3. `my-book/.env` - Set API_BASE_URL

## Quick Fix for Local Development

If you want to switch back to local backend for development:

```typescript
// In my-book/docusaurus.config.ts, line 25:
customFields: {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000', // Changed back
},
```

## Still Having Issues?

1. Share the browser console logs (everything in red)
2. Share the Network tab details for the failed request
3. Check Railway logs for backend errors
4. Verify all environment variables are set correctly on Railway

## Contact/Support
If none of these solutions work, provide:
1. Browser console output
2. Network tab screenshot
3. Railway logs
4. Error messages shown in the UI
