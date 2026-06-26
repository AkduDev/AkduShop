const fs = require('fs');
const { execSync } = require('child_process');

const schemaPath = 'prisma/schema.prisma';
const envPath = '.env';
const envDevPath = '.env.development';
const envProdBackup = '.env.production.bak';

const args = process.argv.slice(2);
const env = args[0]; // 'dev' or 'prod'

if (!env || !['dev', 'prod'].includes(env)) {
  console.log('Uso: node scripts/switch-db.js [dev|prod]');
  console.log('  dev  → SQLite (desarrollo local)');
  console.log('  prod → PostgreSQL (Neon)');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (env === 'dev') {
  schema = schema.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]*(")/,
    '$1sqlite$2'
  );
  console.log('🔄 Cambiando a SQLite (desarrollo)...');
} else {
  schema = schema.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]*(")/,
    '$1postgresql$2'
  );
  console.log('🔄 Cambiando a PostgreSQL (Neon)...');
}

fs.writeFileSync(schemaPath, schema);
console.log('✅ Schema actualizado');

if (env === 'dev') {
  if (fs.existsSync(envDevPath)) {
    fs.copyFileSync(envDevPath, envPath);
    console.log('✅ .env configurado para SQLite (desarrollo)');
  }
} else {
  if (fs.existsSync(envProdBackup)) {
    fs.copyFileSync(envProdBackup, envPath);
    console.log('✅ .env restaurado para PostgreSQL (producción)');
  }
}

console.log('📦 Regenerando Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });
console.log('✅ Prisma Client regenerado');

if (env === 'dev') {
  console.log('\n🎯 Modo DESARROLLO activado');
  console.log('   DB: SQLite local (prisma/db/custom.db)');
  console.log('   Ejecuta: npm run dev');
} else {
  console.log('\n🎯 Modo PRODUCCIÓN activado');
  console.log('   DB: Neon PostgreSQL');
  console.log('   Ejecuta: npm run build && npm start');
}
