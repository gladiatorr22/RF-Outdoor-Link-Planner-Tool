import React from 'react';
import { Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { generateFresnelPolygon } from '../rfUtils';

const LinkLayer = ({ link, isSelected, onClick }) => {
    const start = link.latLngs[0];
    const end = link.latLngs[1];

    const fresnelPolygon = isSelected ? generateFresnelPolygon(start, end, link.fresnelRadius) : null;

    return (
        <React.Fragment>
            {/* Visible Link Line */}
            <Polyline
                positions={link.latLngs}
                geodesic={true} // Handle Earth curvature (Great Circle path)
                pathOptions={{
                    color: '#3b82f6',
                    weight: isSelected ? 6 : 6,
                    opacity: 1,
                    dashArray: null
                }}
                eventHandlers={{
                    click: (e) => {
                        L.DomEvent.stopPropagation(e);
                        onClick(link);
                    },
                    mouseover: (e) => {
                        e.target.setStyle({ cursor: 'pointer' });
                    }
                }}
            />

            {/* Fresnel Zone */}
            {isSelected && fresnelPolygon && (
                <Polygon
                    positions={fresnelPolygon}
                    pathOptions={{
                        color: '#f59e0b',
                        weight: 2,
                        fillColor: '#f59e0b',
                        fillOpacity: 0.2,
                        dashArray: '5, 5'
                    }}
                    eventHandlers={{
                        click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            onClick(link);
                        }
                    }}
                />
            )}
        </React.Fragment>
    );
};

export default LinkLayer;
