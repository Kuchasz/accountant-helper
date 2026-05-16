import 'dotenv/config';
import type { CdnBazy } from './src/db/optimaSchema';
import { getOptimaConfigDb } from './src/db/sqlserver';

async function investigateConfigDb() {
  try {
    console.log('Config credentials:', {
      server: process.env.OPTIMA_CONFIG_SERVER,
      database: process.env.OPTIMA_CONFIG_DATABASE,
      user: process.env.OPTIMA_CONFIG_USER,
    });

    const configDb = await getOptimaConfigDb();
    if (!configDb) {
      console.log('Config database not available');
      return;
    }

    // Get list of tables
    const tables = await configDb.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`,
    );

    console.log('\n=== Available Tables ===');
    const tableList = Array.isArray(tables) ? tables : [];
    console.log(tableList.map((t: any) => t.TABLE_NAME).join('\n'));

    // Check CDN.BAZY table (databases table) - using type from Drizzle schema
    try {
      const result = await configDb.execute(`
        SELECT Baz_ID, Baz_Nazwa, Baz_NazwaBazy, Baz_Aktywna, Baz_Opis, Baz_Serwer 
        FROM CDN.BAZY 
        WHERE Baz_Aktywna = 1
        ORDER BY Baz_Nazwa
      `);

      const bazy = Array.isArray(result) ? result : [];

      console.log('\n=== CDN.BAZY Sample Data (Active Databases) ===');
      console.log(`Found ${bazy.length} active databases:\n`);

      bazy.forEach((db: any) => {
        console.log(`ID: ${db.Baz_ID}`);
        console.log(`Name: ${db.Baz_Nazwa}`);
        console.log(`Database: ${db.Baz_NazwaBazy}`);
        console.log(`Active: ${db.Baz_Aktywna}`);
        console.log(`Server: ${db.Baz_Serwer || 'N/A'}`);
        console.log(`Description: ${db.Baz_Opis || 'N/A'}`);
        console.log('---');
      });
    } catch (e) {
      console.log('\nCDN.BAZY table not found or error:', (e as Error).message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

investigateConfigDb();
