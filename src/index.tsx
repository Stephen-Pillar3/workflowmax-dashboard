import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB?: D1Database
  workflowmaxKV?: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://cas-analysis-dashboard.pages.dev', 'https://workflowmax-dashboard-v2.pages.dev'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    environment: c.env?.NODE_ENV || 'development'
  })
})

// API Dashboard analytics endpoint (mock data for now)
app.get('/api/dashboard/analytics', (c) => {
  const mockData = {
    ytd: {
      revenue: 54225,
      hours: 635,
      effectiveRate: 87.32,
      profitMargin: 43
    },
    monthly: [
      { month: 'Jan', revenue: 8750, hours: 95, billableHours: 88, profit: 3850 },
      { month: 'Feb', revenue: 7200, hours: 82, billableHours: 75, profit: 3100 },
      { month: 'Mar', revenue: 9150, hours: 105, billableHours: 98, profit: 4200 },
      { month: 'Apr', revenue: 6800, hours: 78, billableHours: 70, profit: 2900 },
      { month: 'May', revenue: 8900, hours: 100, billableHours: 92, profit: 3950 },
      { month: 'Jun', revenue: 7625, hours: 87, billableHours: 80, profit: 3300 },
      { month: 'Jul', revenue: 5800, hours: 88, billableHours: 82, profit: 2250 }
    ],
    performance: {
      utilizationRate: 85.2,
      profitabilityTrend: 'up',
      rateRealization: 92.5
    }
  }
  
  return c.json(mockData)
})

// Authentication endpoints (basic structure)
app.post('/api/auth/login', async (c) => {
  // Mock authentication - replace with real auth logic
  const body = await c.req.json()
  
  return c.json({
    success: true,
    user: { id: 1, name: 'Admin User', role: 'admin' },
    token: 'mock-jwt-token'
  })
})

app.get('/api/auth/validate', (c) => {
  // Mock validation - replace with real JWT validation
  return c.json({
    valid: true,
    user: { id: 1, name: 'Admin User', role: 'admin' }
  })
})

// WorkflowMax integration endpoints (placeholder)
app.get('/api/workflowmax/status', (c) => {
  return c.json({
    connected: false,
    message: 'WorkflowMax integration not configured. Please set up OAuth2 credentials.'
  })
})

// Main dashboard route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CAS Analysis Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen flex">
            <!-- Sidebar -->
            <div class="bg-slate-800 text-white w-64 fixed h-full">
                <div class="p-6">
                    <h1 class="text-xl font-bold text-white">
                        <i class="fas fa-chart-line mr-2 text-blue-400"></i>
                        CAS Dashboard
                    </h1>
                    <p class="text-slate-300 text-sm mt-2">Professional Analytics</p>
                </div>
                <nav class="mt-8">
                    <ul class="space-y-2 px-4">
                        <li><a href="/" class="flex items-center px-4 py-3 bg-blue-600 rounded-lg"><i class="fas fa-tachometer-alt mr-3"></i>Dashboard</a></li>
                        <li><a href="#" class="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg"><i class="fas fa-chart-pie mr-3"></i>Profitability</a></li>
                        <li><a href="#" class="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg"><i class="fas fa-users mr-3"></i>Workforce</a></li>
                        <li><a href="#" class="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg"><i class="fas fa-dollar-sign mr-3"></i>Financial</a></li>
                        <li><a href="#" class="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg"><i class="fas fa-cog mr-3"></i>Settings</a></li>
                    </ul>
                </nav>
            </div>

            <!-- Main content -->
            <div class="ml-64 flex-1">
                <header class="bg-white shadow-sm border-b">
                    <div class="px-6 py-4">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
                            <div class="flex items-center space-x-4">
                                <span class="text-sm text-gray-600">Last Updated: <span id="lastUpdated">Loading...</span></span>
                                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-sync mr-2"></i>Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main class="p-6">
                    <!-- KPI Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">YTD Revenue</p>
                                    <p class="text-2xl font-bold text-gray-900" id="ytdRevenue">$0</p>
                                </div>
                                <div class="bg-green-100 p-3 rounded-full">
                                    <i class="fas fa-dollar-sign text-green-600"></i>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Total Hours</p>
                                    <p class="text-2xl font-bold text-gray-900" id="totalHours">0</p>
                                </div>
                                <div class="bg-blue-100 p-3 rounded-full">
                                    <i class="fas fa-clock text-blue-600"></i>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Effective Rate</p>
                                    <p class="text-2xl font-bold text-gray-900" id="effectiveRate">$0</p>
                                </div>
                                <div class="bg-purple-100 p-3 rounded-full">
                                    <i class="fas fa-percentage text-purple-600"></i>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600">Profit Margin</p>
                                    <p class="text-2xl font-bold text-gray-900" id="profitMargin">0%</p>
                                </div>
                                <div class="bg-orange-100 p-3 rounded-full">
                                    <i class="fas fa-chart-line text-orange-600"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Section -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
                            <canvas id="revenueChart" width="400" height="200"></canvas>
                        </div>

                        <div class="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Profit Margin Trend</h3>
                            <canvas id="profitChart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <!-- WorkflowMax Integration Status -->
                    <div class="mt-8">
                        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm text-yellow-700">
                                        <strong>WorkflowMax Integration Required:</strong> 
                                        Configure your WorkflowMax OAuth2 credentials to enable live data synchronization.
                                        <a href="#" class="underline ml-2">Setup Guide</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - CAS Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <div class="text-center mb-8">
                <i class="fas fa-chart-line text-4xl text-blue-600 mb-4"></i>
                <h1 class="text-2xl font-bold text-gray-900">CAS Dashboard</h1>
                <p class="text-gray-600">Professional Accounting Analytics</p>
            </div>
            
            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                </div>
                
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Sign In
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">Demo credentials: admin@example.com / password</p>
            </div>
        </div>

        <script>
            document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();
                // Mock login - redirect to dashboard
                window.location.href = '/';
            });
        </script>
    </body>
    </html>
  `)
})

export default app