import { useMapEvents } from 'react-leaflet';

const MapEvents = ({ interactionMode, onMapClick }) => {
    useMapEvents({
        click(e) {
            if (interactionMode === 'add-tower') {
                onMapClick(e.latlng);
            } else if (interactionMode === 'view') {
                onMapClick(null);
            }
        },
    });
    return null;
};

export default MapEvents;
