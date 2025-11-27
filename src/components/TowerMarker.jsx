import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaTowerBroadcast } from "react-icons/fa6";

const createTowerIcon = (isSelected) => {
   
    const color = '#000000';
    const size = isSelected ? 30 : 25;

    const iconMarkup = renderToStaticMarkup(
        <div style={{
            color: color,
            filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.8))',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: 'bottom center'
        }}>
            <FaTowerBroadcast size={size} />
        </div>
    );

    return L.divIcon({
        html: iconMarkup,
        className: 'custom-tower-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
};

const TowerMarker = ({ tower, isSelected, onTowerClick }) => {
    const icon = createTowerIcon(isSelected);

    return (
        <Marker
            position={[tower.lat, tower.lng]}
            icon={icon}
            eventHandlers={{
                click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    onTowerClick(tower);
                }
            }}
        >
            <Tooltip
                permanent
                direction="top"
                offset={[0, -35]}
                className="!bg-white !text-black !border !border-black !font-sans !font-bold !shadow-none !rounded-none !px-2 !py-0.5 !text-xs"
            >
                {tower.frequency} GHz
            </Tooltip>
        </Marker>
    );
};

export default TowerMarker;
