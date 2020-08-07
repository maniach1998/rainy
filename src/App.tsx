import React from 'react';
import {
	GoogleMap,
	useLoadScript,
	Marker,
	InfoWindow,
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';

import Search from './components/Search';
import Locate from './components/Locate';
import Header from './components/Header';

import mapStyles from './mapStyles';

import './App.css';

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

export default function App() {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
		libraries,
	});

	const [markers, setMarkers] = React.useState([] as any);
	const [selected, setSelected] = React.useState(null as any);

	const onMapClick = React.useCallback((event: any) => {
		setMarkers((current: any) => [
			...current,
			{
				lat: event.latLng.lat(),
				lng: event.latLng.lng(),
				time: new Date(),
			},
		]);
	}, []);

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
		<div>
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
				{markers.map((marker: any) => (
					<Marker
						key={marker.time.toISOString()}
						position={{ lat: marker.lat, lng: marker.lng }}
						icon={{
							url: '/water.svg',
							scaledSize: new window.google.maps.Size(30, 30),
							origin: new window.google.maps.Point(0, 0),
							anchor: new window.google.maps.Point(15, 15),
						}}
						onClick={() => {
							setSelected(marker);
						}}
					/>
				))}

				{selected ? (
					<InfoWindow
						position={{ lat: selected.lat, lng: selected.lng }}
						onCloseClick={() => {
							setSelected(null);
						}}>
						<div>
							<h2>Water logged!</h2>
							<p>
								Logged:{' '}
								{formatRelative(selected.time, new Date())}
							</p>
						</div>
					</InfoWindow>
				) : null}
			</GoogleMap>
		</div>
	);
}
