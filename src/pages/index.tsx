import React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useQuery, useMutation, queryCache } from 'react-query';

import Search from '../components/Search';
import Locate from '../components/Locate';
import Header from '../components/Header';
import AlertWindow from '../components/AlertWindow';

import mapStyles from '../mapStyles';

const libraries = ['places'];
const mapContainerStyle = {
	width: '100vw',
	height: '100vh',
};
const center = {
	lat: 19.07609,
	lng: 72.877426,
};
const options: any = {
	styles: mapStyles,
	disableDefaultUI: true,
	zoomControl: true,
};

async function fetchRainyRequest() {
	const response = await fetch('/api/rainy');
	const { rainy } = await response.json();

	return rainy.map((logging: any) => ({
		id: logging._id,
		longitude: logging.location.coordinates.longitude,
		latitude: logging.location.coordinates.latitude,
		createdAt: logging.createdAt,
	}));
}

async function createRainyRequest(rainyData: any) {
	const response = await fetch('/api/rainy/create', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ rainy: rainyData }),
	});
	const data = await response.json();
	return data.sighting;
}

function useCreateRainy() {
	return useMutation(createRainyRequest, {
		onMutate: (rainyData) => {
			queryCache.cancelQueries('rainy');
			const snapshot = queryCache.getQueryData('rainy');

			queryCache.setQueryData('rainy', (prev: any) => [
				...prev,
				{
					id: new Date().toISOString(),
					longitude: rainyData.longitude,
					latitude: rainyData.latitude,
					createdAt: new Date().toISOString(),
				},
			]);

			return () => queryCache.setQueryData('rainy', snapshot);
		},
		onError: (error, rainyData, rollback: any) => rollback(),
		onSettled: () => queryCache.invalidateQueries('rainy'),
	});
}

export default function App() {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
		libraries,
	});

	const [selected, setSelected] = React.useState(null as any);
	const { data: rainy } = useQuery('rainy', fetchRainyRequest);
	const [createRainy] = useCreateRainy();

	const onMapClick = React.useCallback(
		(event: any) => {
			createRainy({
				latitude: event.latLng.lat(),
				longitude: event.latLng.lng(),
			});
		},
		[createRainy]
	);

	const mapRef: any = React.useRef();
	const onMapLoad = React.useCallback((map) => {
		mapRef.current = map;
	}, []);

	const panTo = React.useCallback(({ lat, lng }) => {
		mapRef.current.panTo({ lat, lng });
		mapRef.current.setZoom(14);
	}, []);

	if (loadError) return <div>Error loading maps</div>;
	if (!isLoaded) return <div>Loading Maps</div>;

	return (
		<>
			<Header />
			<Search panTo={panTo} />
			<Locate panTo={panTo} />

			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				zoom={10}
				center={center}
				options={options}
				onClick={onMapClick}
				onLoad={onMapLoad}>
				{Array.isArray(rainy) &&
					rainy.map((logging: any) => (
						<Marker
							key={logging.id}
							position={{
								lat: logging.latitude,
								lng: logging.longitude,
							}}
							onClick={() => setSelected(logging)}
							icon={{
								url: '/water.svg',
								scaledSize: new window.google.maps.Size(30, 30),
								origin: new window.google.maps.Point(0, 0),
								anchor: new window.google.maps.Point(15, 15),
							}}
						/>
					))}

				{selected && (
					<AlertWindow
						selected={selected}
						close={() => setSelected(null)}
					/>
				)}
			</GoogleMap>
		</>
	);
}
