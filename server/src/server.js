const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testConnection();

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 School Management ERP Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });

    const gracefulShutdown = () => {
      console.log('\nReceived kill signal, shutting down gracefully...');
      server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

