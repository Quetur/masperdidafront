import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const PreviewCard = ({ mascotaData, previewImage, maestros }) => {
  const catObj = maestros.cat?.find(c => Number(c.id_categoria) === Number(mascotaData.id_categoria));
  const tipoObj = maestros.tipo?.find(t => Number(t.id_tipo) === Number(mascotaData.id_tipo));
  const razaObj = maestros.raza?.find(r => Number(r.id_raza) === Number(mascotaData.id_raza));
  
  const center = [mascotaData.latitud || -34.661, mascotaData.longitud || -58.662];

  return (
    /* flex-shrink-0 evita que el contenedor padre achique la card */
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200 my-2 flex-shrink-0">
      <div className={`py-2 text-center font-black text-white ${Number(mascotaData.id_categoria) === 20 ? 'bg-red-600' : 'bg-green-600'}`}>
        {catObj ? catObj.des.toUpperCase() : 'REPORTE'}
      </div>
      
      {previewImage && <img src={previewImage} className="w-full h-44 object-cover" alt="Mascota" />}
      
      <div className="p-4 text-left">
        <h3 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2">
          {tipoObj?.icono || '🐾'} {mascotaData.titulo || 'Sin nombre'}
        </h3>
        
        <p className="text-blue-600 font-bold text-xs mb-1">Raza: {razaObj?.des || 'No especificada'}</p>
        <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase">Zona Ituzaingó • {mascotaData.sexo || 'Macho'}</p>
        
        {/* Contenedor del mapa con altura fija garantizada */}
        <div className="h-40 w-full rounded-xl overflow-hidden mb-3 border border-gray-100 pointer-events-none">
          <MapContainer center={center} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={center} />
          </MapContainer>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-200">
          <span className="text-xl">👤</span> 
          <div className="flex flex-col">
            <span className="text-[10px] uppercase opacity-70">Contacto: {mascotaData.nombre_contacto}</span>
            <span className="leading-none text-sm font-black">📞 {mascotaData.celular}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;