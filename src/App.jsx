import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Menu } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

import Sidebar from './components/Sidebar'
import MapEvents from './components/MapEvents'
import TowerMarker from './components/TowerMarker'
import LinkLayer from './components/LinkLayer'

import {
  getDistance,
  calculateFresnelRadius,
  getElevation,
  getProfilePoints,
  getElevationProfile
} from './rfUtils'

function App() {
  const [towers, setTowers] = useState([])
  const [links, setLinks] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Interaction State
  const [interactionMode, setInteractionMode] = useState('view') // 'view', 'add-tower', 'connect'
  const [selectedItem, setSelectedItem] = useState(null) // { type: 'tower' | 'link', id: ... }
  const [connectSourceId, setConnectSourceId] = useState(null) // ID of first tower clicked in connect mode

  const handleMapClick = (latlng) => {
    if (interactionMode === 'add-tower' && latlng) {
      const newTower = {
        id: Date.now(),
        lat: latlng.lat,
        lng: latlng.lng,
        frequency: 5.8 // Default freq
      }
      setTowers(prev => [...prev, newTower])
      setSelectedItem({ type: 'tower', id: newTower.id })
      setInteractionMode('view')
      setIsSidebarOpen(true) // Open sidebar to show details of new tower
    } else if (interactionMode === 'view') {
      setSelectedItem(null)
    }
  }

  const handleTowerClick = (clickedTower) => {
    if (interactionMode === 'connect') {
      if (!connectSourceId) {
        setConnectSourceId(clickedTower.id)
      } else {
        if (connectSourceId === clickedTower.id) {
          setConnectSourceId(null)
          return
        }

        const sourceTower = towers.find(t => t.id === connectSourceId)
        const targetTower = clickedTower

        if (sourceTower.frequency !== targetTower.frequency) {
          alert(`Frequency Mismatch! Source: ${sourceTower.frequency}GHz, Target: ${targetTower.frequency}GHz`)
          setConnectSourceId(null)
          return
        }

        const dist = getDistance(sourceTower.lat, sourceTower.lng, targetTower.lat, targetTower.lng)
        const radius = calculateFresnelRadius(dist, sourceTower.frequency)

        const newLink = {
          id: `${sourceTower.id}-${targetTower.id}`,
          sourceId: sourceTower.id,
          targetId: targetTower.id,
          frequency: sourceTower.frequency,
          distance: dist,
          fresnelRadius: radius,
          latLngs: [
            [sourceTower.lat, sourceTower.lng],
            [targetTower.lat, targetTower.lng]
          ]
        }

        setLinks(prev => [...prev, newLink])
        setConnectSourceId(null)
        setInteractionMode('view')
        setIsSidebarOpen(true) // Auto-open sidebar so user can see/select the new link
      }
    } else {
      setSelectedItem({ type: 'tower', id: clickedTower.id })
      setInteractionMode('view')
      setIsSidebarOpen(true) // Open sidebar when selecting a tower
    }
  }

  const handleLinkClick = async (link, isNew = false) => {
    setSelectedItem({ type: 'link', id: link.id })
    setIsSidebarOpen(true) // Open sidebar when selecting a link

    if (!link.elevationData || !link.elevationProfile) {
      const sourceTower = towers.find(t => t.id === link.sourceId)
      const targetTower = towers.find(t => t.id === link.targetId)

      if (sourceTower && targetTower) {
        const midLat = (sourceTower.lat + targetTower.lat) / 2
        const midLng = (sourceTower.lng + targetTower.lng) / 2

        try {
          const [e1, e2, eMid] = await Promise.all([
            getElevation(sourceTower.lat, sourceTower.lng),
            getElevation(targetTower.lat, targetTower.lng),
            getElevation(midLat, midLng)
          ])

          const elevationData = {
            source: e1,
            target: e2,
            midpoint: eMid
          }

          const profilePoints = getProfilePoints(
            [sourceTower.lat, sourceTower.lng],
            [targetTower.lat, targetTower.lng],
            20
          );
          const elevationProfile = await getElevationProfile(profilePoints);

          setLinks(prev => prev.map(l => l.id === link.id ? { ...l, elevationData, elevationProfile } : l))
        } catch (err) {
          console.error("Error fetching elevation:", err)
        }
      }
    }
  }

  const handleDelete = (item) => {
    if (item.type === 'tower') {
      setTowers(prev => prev.filter(t => t.id !== item.id))
      setLinks(prev => prev.filter(l => l.sourceId !== item.id && l.targetId !== item.id))
    } else if (item.type === 'link') {
      setLinks(prev => prev.filter(l => l.id !== item.id))
    }
    setSelectedItem(null)
  }

  const handleUpdateTower = (id, updates) => {
    setTowers(prev => {
      const newTowers = prev.map(t => t.id === id ? { ...t, ...updates } : t)

      if (updates.frequency) {
        setLinks(currentLinks => {
          return currentLinks.filter(link => {
            const source = newTowers.find(t => t.id === link.sourceId)
            const target = newTowers.find(t => t.id === link.targetId)

            if (!source || !target) return false

            return source.frequency === target.frequency
          })
        })
      }

      return newTowers
    })
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">

      {/* Mobile Header */}
      <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-[1002] shrink-0">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          RF Link Planner
        </h1>
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar
          towers={towers}
          links={links}
          selectedItem={selectedItem}
          onSelectItem={setSelectedItem}
          onDelete={handleDelete}
          onUpdateTower={handleUpdateTower}
          interactionMode={interactionMode}
          setInteractionMode={(mode) => {
            setInteractionMode(mode)
            setConnectSourceId(null)
            if (mode !== 'view') setSelectedItem(null)
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 relative z-0">
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapEvents
              interactionMode={interactionMode}
              onMapClick={handleMapClick}
            />

            {links.map(link => (
              <LinkLayer
                key={link.id}
                link={link}
                isSelected={selectedItem?.type === 'link' && selectedItem.id === link.id}
                onClick={() => handleLinkClick(link)}
              />
            ))}

            {towers.map(tower => (
              <TowerMarker
                key={tower.id}
                tower={tower}
                isSelected={
                  (selectedItem?.type === 'tower' && selectedItem.id === tower.id) ||
                  (connectSourceId === tower.id)
                }
                onTowerClick={handleTowerClick}
              />
            ))}

          </MapContainer>

          {interactionMode === 'connect' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-[1000] text-sm font-bold animate-pulse">
              {connectSourceId ? "Select Second Tower" : "Select First Tower"}
            </div>
          )}
          {interactionMode === 'add-tower' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-[1000] text-sm font-bold animate-pulse">
              Click Map to Place Tower
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App