import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Phone, User, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatPKR } from '../../utils/formatters';

const TransportPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const res = await api.get('/transport');
        if (res.data?.success) {
          setVehicles(res.data.vehicles || []);
          setRoutes(res.data.routes || []);
        }
      } catch (err) {
        console.error('Failed to load transport:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transport Fleet & Routes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            School bus fleet management, driver verification, and pickup/drop route stops
          </p>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading transport fleet..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicles Fleet */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Bus className="w-4 h-4 text-blue-600" />
              <span>School Buses & Vans</span>
            </h3>
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{v.vehicleNo}</h4>
                      <Badge variant="success">{v.status.toUpperCase()}</Badge>
                    </div>
                    <p className="text-slate-600 mt-1">{v.model} • Capacity: {v.capacity} Seats</p>
                    <p className="text-slate-500 mt-0.5">Driver: <strong>{v.driverName}</strong> ({v.driverPhone})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Routes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Active Bus Routes</span>
            </h3>
            <div className="space-y-3">
              {routes.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{r.title}</h4>
                    <span className="font-bold text-emerald-600">{formatPKR(r.fareAmount)}/mo</span>
                  </div>
                  <p className="text-slate-600">From: <strong>{r.startPoint}</strong> → To: <strong>{r.endPoint}</strong></p>
                  {r.stops?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Stops</span>
                      <div className="flex flex-wrap gap-1">
                        {r.stops.map((s) => (
                          <span key={s.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                            {s.stopName} ({s.pickupTime?.slice(0, 5)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportPage;

