import React from 'react';
import moment from 'moment';
import { InfoWindow } from '@react-google-maps/api';

export default function AlertWindow({ selected, close }: any) {
	return (
		<InfoWindow
			position={{
				lat: selected.latitude,
				lng: selected.longitude,
			}}
			onCloseClick={() => close()}>
			<div>
				<h2>Water logged!</h2>
				<p>Logged {moment(selected.createdAt).fromNow()}</p>
			</div>
		</InfoWindow>
	);
}
