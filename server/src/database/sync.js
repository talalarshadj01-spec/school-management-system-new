const { sequelize } = require('../models');

async function syncDatabase(force = false) {
  try {
    console.log(`⏳ Synchronizing database tables (force: ${force})...`);
    await sequelize.sync({ force, alter: !force });
    console.log('✅ All database tables synchronized successfully with PostgreSQL.');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  syncDatabase(force)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = syncDatabase;

