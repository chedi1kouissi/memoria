# Troubleshooting - Frontend Shows Mock Data

## Issue
The frontend is still showing mock data even though the backend server is running.

## What We Know (✅ Working)
1. ✅ Backend server is running on `http://localhost:5000`
2. ✅ API health check responds correctly with graph statistics
3. ✅ `/api/graph` endpoint returns real data (nodes and edges)
4. ✅ `trace.json` contains 6 events with rich metadata
5. ✅ Frontend is configured to call `http://localhost:5000/api`
6. ✅ CORS is enabled on the backend

## Debugging Steps

### 1. Check Browser Console

The frontend now has debug logging. Open your browser console (F12) and look for:

```
[API] fetchGraph result: { nodeCount: X, edgeCount: Y, ... }
[API] fetchDashboard result: { cardCount: X, stats: {...} }
```

**If you see:**
- `nodeCount: 0` → Backend is returning empty data (see step 2)
- `[API] Backend unavailable` → Network error (see step 3)
- No logs at all → Frontend not making requests (see step 4)

### 2. If Backend Returns Empty Data

The backend builds the graph from `trace.json` when `graph.json` is empty. Check:

```bash
# Navigate to backend folder
cd back\memora_os

# Check if trace.json has data
type data\trace.json | findstr "event_type"

# Check if graph.json is empty
type data\graph.json
```

**Expected**: `trace.json` should have 6 events. `graph.json` might be `{}` or empty.

**If trace.json is empty:**
- The backend hasn't ingested any data yet
- You can run the full pipeline: `python main.py` (requires Ollama, calendar/email access)
- OR manually add events to `trace.json` (see example format in existing file)

### 3. If Network Error (CORS/Connection)

Test the API directly from PowerShell:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/health -UseBasicParsing

# Test graph endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/graph -UseBasicParsing

# Test dashboard endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/dashboard -UseBasicParsing
```

**If these fail:**
- Check firewall settings
- Ensure the backend server is actually running: `ps | findstr python`
- Check the backend terminal for errors

**If you see CORS errors in browser console:**
- Restart the backend server
- Ensure Flask-CORS is installed: `pip install flask-cors`

### 4. If Frontend Not Making Requests

This could mean:
- The components aren't mounting (React error)
- The API service isn't being called
- TypeScript compilation errors

**Check:**
```bash
# Check for build errors
npm run build
```

Look for TypeScript errors in:
- `src/components/MemoryGraph.tsx`
- `src/components/Dashboard.tsx`
- `src/components/ContextPanel.tsx`

### 5. Force Hard Refresh

Sometimes the browser caches old code:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"
4. OR press `Ctrl+Shift+R`

### 6. Check Current Data Flow

Open the **Network** tab in DevTools:

1. Filter by "XHR" or "Fetch"
2. Navigate to Memory Graph page
3. Look for requests to `localhost:5000/api/graph`
4. Click the request to see:
   - Status code (should be 200)
   - Response (should show nodes array)
   - Timing (should be < 5 seconds)

## Quick Fix Checklist

- [ ] Backend server is running (`.\op\Scripts\activate.ps1; python server.py`)
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Hard refresh the browser (`Ctrl+Shift+R`)
- [ ] Check browser console for `[API]` logs
- [ ] Check Network tab for requests to `localhost:5000`
- [ ] Verify `trace.json` has data (`type back\memora_os\data\trace.json`)

## Common Issues & Solutions

### Issue: "AbortSignal.timeout is not a function"
- **Cause**: Old Node.js version
- **Fix**: Use Node.js 18+ or remove `.timeout()` from fetch calls

### Issue: Requests timeout after 5 seconds
- **Cause**: Backend is slow (building graph from trace takes time)
- **Fix**: Increase timeout in `apiService.ts`:
  ```typescript
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) }); // 10s
  ```

### Issue: Data appears briefly then disappears
- **Cause**: State management issue
- **Fix**: Check React state updates in MemoryGraph/Dashboard components

### Issue: TypeScript "Cannot find module" errors
- **Fix**: 
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm run dev
  ```

## Still Not Working?

Share these details:
1. **Browser console logs** (copy/paste anything with `[API]`)
2. **Network tab screenshot** (filter by localhost:5000)
3. **Backend terminal output** (the Flask server logs)
4. **Result of**: `Invoke-WebRequest -Uri http://localhost:5000/api/graph -UseBasicParsing`
