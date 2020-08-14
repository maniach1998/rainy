import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '../../../utils/database';

export default async function (req: NextApiRequest, res: NextApiResponse) {
	try {
		const { db } = await connect();
		const rainy = await db.collection('rainy').find().toArray();

		res.status(200);
		res.json({ rainy });
	} catch (err) {
		res.status(500);
		res.json({ error: 'Unable to fetch loggings' });
	}
}
