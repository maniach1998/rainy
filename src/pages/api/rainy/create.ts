import { NextApiRequest, NextApiResponse } from 'next';
import { connect } from '../../../utils/database';

export default async function (req: NextApiRequest, res: NextApiResponse) {
	try {
		const { db } = await connect();
		const {
			rainy: { latitude, longitude },
		} = req.body;

		const result = await db.collection('rainy').insertOne({
			location: {
				type: 'Point',
				coordinates: { longitude, latitude },
			},
			createdAt: new Date(),
		});

		res.status(201);
		res.json({ rainy: result.ops[0] });
	} catch (err) {
		res.status(500);
		res.json({ error: 'Unable to insert logging' });
	}
}
