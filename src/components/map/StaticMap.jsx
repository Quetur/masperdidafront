import React from 'react';

export const StaticMap = ({ lat, lng }) => {
  const mapUrl = `https://static-maps.yandex.ru/1.x/?lang=es_AR&ll=${lng},${lat}&z=14&l=map&size=300,200&pt=${lng},${lat},pm2rdm`;
  return (
    <div className="mt-2 rounded-xl overflow-hidden border">
      <img src={mapUrl} alt="Ubicación" className="w-full h-auto" />
    </div>
  );
};