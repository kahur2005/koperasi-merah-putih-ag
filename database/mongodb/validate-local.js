import { MongoClient } from 'mongodb';
import {
  COLLECTIONS,
  DEMO_KOPERASI_REF,
  DEMO_SESSION_ID,
  MONGO_DB_NAME,
  MONGO_URI,
} from './config.js';

async function count(db, collection, filter = {}) {
  return db.collection(collection).countDocuments(filter);
}

async function validate() {
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 3000 });

  try {
    await client.connect();
    const db = client.db(MONGO_DB_NAME);

    const session = await db.collection(COLLECTIONS.gameSessions).findOne({ session_id: DEMO_SESSION_ID });
    const products = await count(db, COLLECTIONS.produkKoperasi, { koperasi_ref: DEMO_KOPERASI_REF });
    const inventory = await count(db, COLLECTIONS.inventarisProduk, { koperasi_ref: DEMO_KOPERASI_REF });
    const members = await count(db, COLLECTIONS.anggotaKoperasi, { koperasi_ref: DEMO_KOPERASI_REF });
    const suppliers = await count(db, COLLECTIONS.gameSupplierState, { session_id: DEMO_SESSION_ID, day_number: 1 });
    const events = await count(db, COLLECTIONS.gameEvents, { session_id: DEMO_SESSION_ID });

    const checks = [
      ['demo session exists', Boolean(session)],
      ['demo session day is 1', session?.day_number === 1],
      ['demo session starts with money', session?.money === 5000000],
      ['three products seeded', products === 3],
      ['three inventory rows seeded', inventory === 3],
      ['core NPC pool seeded', members >= 8],
      ['PT and UMKM supplier rows seeded', suppliers === 6],
      ['starting events seeded', events >= 2],
    ];

    for (const [label, passed] of checks) {
      console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
    }

    if (checks.some(([, passed]) => !passed)) {
      process.exitCode = 1;
      return;
    }

    console.log(`MongoDB validation passed for "${MONGO_DB_NAME}" at ${MONGO_URI}`);
  } finally {
    await client.close();
  }
}

validate().catch((error) => {
  console.error('MongoDB validation failed.');
  console.error(error.message);
  process.exitCode = 1;
});
