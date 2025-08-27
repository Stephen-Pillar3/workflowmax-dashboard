// PM2 ecosystem configuration for webapp
// Supports both local development and D1 database configurations

module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --kv workflowmaxKV --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        ENVIRONMENT: 'development'
      },
      watch: false, // Disable PM2 file monitoring (wrangler handles hot reload)
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Logging
      out_file: './logs/webapp-out.log',
      error_file: './logs/webapp-error.log',
      log_file: './logs/webapp-combined.log',
      time: true
    },
    {
      name: 'webapp-d1',
      script: 'npx', 
      args: 'wrangler pages dev dist --d1=workflowmax_d1 --kv workflowmaxKV --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        ENVIRONMENT: 'development'
      },
      watch: false, // Disable PM2 file monitoring (wrangler handles hot reload)
      instances: 1, // Development mode uses only one instance
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Logging
      out_file: './logs/webapp-d1-out.log',
      error_file: './logs/webapp-d1-error.log',
      log_file: './logs/webapp-d1-combined.log',
      time: true
    }
  ]
}