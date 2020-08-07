import React from 'react';

export default function Locate({ panTo }: any) {
	return (
		<button
			className='locate'
			onClick={() => {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						panTo({
							lat: position.coords.latitude,
							lng: position.coords.longitude,
						});
					},
					(error) => {
						console.log(error);
					}
				);
			}}>
			<img src='compass.svg' alt='Compass - locate me' />
		</button>
	);
}
