import React from 'react';
import { StaticMap } from '../map/StaticMap'; // Asegurate que StaticMap.jsx use 'export const StaticMap'

export const ChatMessage = ({ msg }) => {
  const isUser = msg.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
      <div className={`max-w-[85%] p-3 rounded-2xl text-[15px] shadow-sm ${
        isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
      }`}>
        {msg.text}
        {msg.type === 'map' && <StaticMap lat={msg.lat} lng={msg.lng} />}
      </div>
    </div>
  );
};