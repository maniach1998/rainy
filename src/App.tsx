import React from 'react';
import {
	GoogleMap,
	useLoadScript,
	Marker,
	InfoWindow,
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';

import usePlacesAutocomplete, {
	getGeocode,
	getLatLng,
} from 'use-places-autocomplete';
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	ComboboxList,
	ComboboxOption,
} from '@reach/combobox';
import '@reach/combobox/styles.css';

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
			<h1>
				Rainy{' '}
				<span role='img' aria-label='rain'>
					🌧
				</span>
			</h1>

			<Search panTo={panTo} />
			<Locate panTo={panTo} />

			<GoogleMap
				mapContainerStyle={mapContainerStyle}
				zoom={8}
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

function Locate({ panTo }: any) {
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

function Search({ panTo }: any) {
	const {
		ready,
		value,
		suggestions: { status, data },
		setValue,
		clearSuggestions,
	} = usePlacesAutocomplete({
		requestOptions: {
			location: new google.maps.LatLng(19.07609, 72.877426),
			radius: 200 * 1000,
		},
	});

	return (
		<div className='search'>
			<Combobox
				onSelect={async (address) => {
					setValue(address, false);
					clearSuggestions();

					try {
						const result = await getGeocode({ address });
						const { lat, lng } = await getLatLng(result[0]);
						panTo({ lat, lng });
					} catch (error) {
						console.log(error);
					}
				}}>
				<ComboboxInput
					value={value}
					onChange={(e: React.FormEvent<HTMLInputElement>) => {
						setValue(e.currentTarget.value);
					}}
					disabled={!ready}
					placeholder='Enter an address'
				/>
				<ComboboxPopover>
					<ComboboxList>
						{status === 'OK' &&
							data.map(({ id, description }) => (
								<ComboboxOption key={id} value={description} />
							))}
					</ComboboxList>
				</ComboboxPopover>
			</Combobox>
		</div>
	);
}
