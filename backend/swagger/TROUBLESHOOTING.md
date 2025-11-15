# Swagger UI Troubleshooting

## If you can't see new APIs in Swagger UI

### Solution 1: Hard Refresh Browser Cache
1. **Chrome/Edge**: Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Firefox**: Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. **Safari**: Press `Cmd+Option+R`

### Solution 2: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 3: Restart Swagger Server
1. Stop the current swagger server (Ctrl+C)
2. Restart it:
   ```bash
   cd backend
   npm run swagger
   ```
3. Open a new browser tab/window and go to `http://localhost:8080`

### Solution 4: Check File is Updated
Verify the swagger.yaml file has all endpoints:
```bash
cd backend
grep "^  /" swagger/swagger.yaml
```

You should see:
- `/auth/signup`
- `/auth/login`
- `/auth/confirm`
- `/auth/refresh`
- `/projects`
- `/projects/{id}`
- `/projects/{projectId}/tasks`
- `/tasks/{id}`

### Solution 5: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors loading `swagger.yaml`
4. Check Network tab to see if `swagger.yaml` is being loaded

### Solution 6: Use Incognito/Private Mode
Open Swagger UI in an incognito/private browser window to bypass cache.

