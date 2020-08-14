import { MongoClient } from 'mongodb';

const database_key: any = process.env.DATABASE_URL;

const client = new MongoClient(database_key, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function connect() {
	if (!client.isConnected()) await client.connect();
	const db = client.db('rainy');
	return { db, client };
}

export { connect };
