import React, { useState, useEffect } from 'react';
import { fetchFarmers } from '../services/api';
import { User } from '../types';
import { Users, MapPin, Award, Phone, Calendar, ArrowRight } from 'lucide-react';

interface Props {
  onNavigateToFarmerBatches: (farmerId: string) => void;
}

export const FarmerDirectoryPage: React.FC<Props> = ({ onNavigateToFarmerBatches }) => {
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await fetchFarmers();
        setFarmers(list);
      } catch (err) {
        console.error('Failed to load farmers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          Farmer Directory <Users size={20} className="text-onion-amber" />
        </h1>
        <p className="text-xs text-slate-400">
          Registered horticultural growers across Pune, Nashik, Solapur, and Ahmednagar APMC hubs.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading farmer profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {farmers.map((farmer) => (
            <div
              key={farmer.userId}
              className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 hover:border-onion-ruby/50 transition-all group"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-onion-ruby to-onion-amber flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-onion-amber transition-colors">
                      {farmer.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{farmer.userId}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {farmer.acres || 4.5} Acres
                </span>
              </div>

              {/* Info Details */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={14} className="text-onion-amber" />
                  <span>{farmer.village || 'Manchar, Pune'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-mono">{farmer.phoneNumber}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onNavigateToFarmerBatches(farmer.userId)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-onion-ruby/30 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <span>View Farmer Batch History</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
