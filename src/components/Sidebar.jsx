import React from 'react';
import { Trash2, Radio, Activity, MousePointer2, Plus, Cable, X } from 'lucide-react';

const Sidebar = ({
    towers,
    links,
    selectedItem,
    onSelectItem,
    onDelete,
    onUpdateTower,
    interactionMode,
    setInteractionMode,
    isOpen,
    onClose
}) => {

    const renderContent = () => {
        if (!selectedItem) {
            return (
                <div className="text-slate-400 text-sm text-center mt-10 space-y-6">
                    <div>
                        <p>Select a tower or link to view details.</p>
                        <p className="mt-2">
                            <span className="font-bold text-slate-300">{towers.length}</span> Towers <br />
                            <span className="font-bold text-slate-300">{links.length}</span> Links
                        </p>
                    </div>

                    {links.length > 0 && (
                        <>
                            {/* Mobile-only Link List for easier selection */}
                            <div className="md:hidden px-4 space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Select a Link to View Zone</p>
                                {links.map((link, index) => (
                                    <button
                                        key={link.id}
                                        onClick={() => onSelectItem({ type: 'link', id: link.id })}
                                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded flex items-center justify-between hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Activity size={16} className="text-blue-400" />
                                            <span className="text-sm font-medium text-slate-200">Link {index + 1}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">{(link.distance / 1000).toFixed(2)} km</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mx-4 p-3 bg-slate-800 rounded border border-slate-700 text-left hidden md:block">
                                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Fresnel Zone</h4>
                                <p className="text-xs text-slate-300">
                                    Click on a blue link line to see the Fresnel zone.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            );
        }

        if (selectedItem.type === 'tower') {
            const tower = towers.find(t => t.id === selectedItem.id);
            if (!tower) return null;

            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Radio size={18} className="text-blue-400" /> Tower Details
                        </h3>
                        <button
                            onClick={() => onDelete(selectedItem)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800 transition-colors"
                            title="Delete Tower"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Frequency (GHz)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={tower.frequency}
                            onChange={(e) => onUpdateTower(tower.id, { frequency: parseFloat(e.target.value) })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                        <p>ID: {tower.id}</p>
                        <p>Lat: {tower.lat.toFixed(6)}</p>
                        <p>Lng: {tower.lng.toFixed(6)}</p>
                    </div>
                </div>
            );
        }

        if (selectedItem.type === 'link') {
            const link = links.find(l => l.id === selectedItem.id);
            if (!link) return null;

            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Activity size={18} className="text-green-400" /> Link Details
                        </h3>
                        <button
                            onClick={() => onDelete(selectedItem)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800 transition-colors"
                            title="Delete Link"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Frequency:</span>
                            <span>{link.frequency} GHz</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Distance:</span>
                            <span>{(link.distance / 1000).toFixed(2)} km</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Fresnel Radius:</span>
                            <span>{link.fresnelRadius.toFixed(1)} m</span>
                        </div>

                        {link.elevationData && (
                            <div className="pt-2 border-t border-slate-700 mt-2">
                                <p className="text-xs font-bold text-slate-400 mb-1">Terrain Elevation (approx)</p>
                                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                    <div className="bg-slate-800 p-1 rounded">
                                        <span className="block text-slate-500">Source</span>
                                        {link.elevationData.source.toFixed(0)}m
                                    </div>
                                    <div className="bg-slate-800 p-1 rounded">
                                        <span className="block text-slate-500">Mid</span>
                                        {link.elevationData.midpoint.toFixed(0)}m
                                    </div>
                                    <div className="bg-slate-800 p-1 rounded">
                                        <span className="block text-slate-500">Target</span>
                                        {link.elevationData.target.toFixed(0)}m
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Fresnel Zone</h4>
                        <p className="text-xs text-slate-300">
                            The orange ellipse on the map represents the 1st Fresnel Zone. Ensure this area is clear of obstacles for optimal signal.
                        </p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={`
            bg-slate-900 border-r border-slate-800 flex flex-col h-full text-white shadow-xl z-[1001]
            absolute inset-y-0 left-0 w-80 transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    RF Link Planner
                </h1>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="md:hidden text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="p-2 grid grid-cols-3 gap-2 border-b border-slate-800 bg-slate-900/50">
                <button
                    onClick={() => { setInteractionMode('view'); if (window.innerWidth < 768) onClose(); }}
                    className={`flex flex-col items-center justify-center p-2 rounded transition-all ${interactionMode === 'view' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    <MousePointer2 size={20} />
                    <span className="text-[10px] mt-1 font-medium">Select</span>
                </button>
                <button
                    onClick={() => { setInteractionMode('add-tower'); if (window.innerWidth < 768) onClose(); }}
                    className={`flex flex-col items-center justify-center p-2 rounded transition-all ${interactionMode === 'add-tower' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    <Plus size={20} />
                    <span className="text-[10px] mt-1 font-medium">Add Tower</span>
                </button>
                <button
                    onClick={() => { setInteractionMode('connect'); if (window.innerWidth < 768) onClose(); }}
                    className={`flex flex-col items-center justify-center p-2 rounded transition-all ${interactionMode === 'connect' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                    <Cable size={20} />
                    <span className="text-[10px] mt-1 font-medium">Connect</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default Sidebar;
