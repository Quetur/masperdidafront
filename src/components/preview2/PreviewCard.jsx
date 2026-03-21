import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const PreviewCard = ({ mascotaData, previewImage, maestros }) => {
  const catObj = maestros.cat.find(c => c.id_categoria === parseInt(mascotaData.id_categoria));
  const tipoObj = maestros.tipo.find(t => t.id_tipo === parseInt(mascotaData.id_tipo));
  
  const getEmoji = (tipo) => {
    if (!tipo) return '🐾';
    const desc = tipo.des.toLowerCase();
    if (desc.includes('perro')) return '🐶';
    if (desc.includes('gato')) return '🐱';
    return '🐾';
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200 animate-in zoom-in my-2">
      <div className={`py-2 text-center font-black text-white ${mascotaData.id_categoria === 20 ? 'bg-red-600' : 'bg-green-600'}`}>
        {catObj ? catObj.des.toUpperCase() : 'REPORTE'}
      </div>
      {previewImage && <img src={previewImage} className="w-full h-40 object-cover" alt="Mascota" />}
      <div className="p-4 text-left text-gray-800">
        <h3 className="text-xl font-bold uppercase flex items-center gap-2">
          {getEmoji(tipoObj)} {mascotaData.titulo || 'Sin nombre'}
          <span className="text-[10px] font-normal opacity-40 ml-1">({tipoObj?.des || ''})</span>
        </h3>
        <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-tighter">Zona Ituzaingó • {mascotaData.sexo}</p>
        
        <div className="h-32 w-full rounded-xl overflow-hidden mb-3 border border-gray-100 pointer-events-none">
          <MapContainer center={[mascotaData.latitud, mascotaData.longitud]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[mascotaData.latitud, mascotaData.longitud]} />
          </MapContainer>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 font-bold p-3 rounded-2xl border border-blue-200 shadow-sm">
          <span className="text-xl">👤</span> 
          <div className="flex flex-col">
            <span className="text-[10px] uppercase opacity-70">Contacto: {mascotaData.nombre_contacto || 'Usuario'}</span>
            <span className="leading-none">{mascotaData.nota}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;