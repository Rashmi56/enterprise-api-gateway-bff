import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [metrics, setMetrics] = useState([]);
  const [clientId, setClientId] = useState('senior-architect-client');
  const [systemLogs, setSystemLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, throttled: 0 });

  // Function to fire an HTTP request to our Spring Boot Gateway
  const fireRequest = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      const response = await axios.get(`https://ideal-space-funicular-vqrwj4ppp4rcx574-8080.app.github.dev/api/v1/resource?client=${clientId}`);
      
      // Update UI Counters
      setStats(prev => ({ ...prev, total: prev.total + 1, success: prev.success + 1 }));
      
      // Add record to live tracking chart data state
      updateChartMetrics(timestamp, 1, 0);
      setSystemLogs(prev => [`[${timestamp}] HTTP 200 - Request Allowed cleanly.`, ...prev.slice(0, 9)]);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setStats(prev => ({ ...prev, total: prev.total + 1, throttled: prev.throttled + 1 }));
        updateChartMetrics(timestamp, 0, 1);
        setSystemLogs(prev => [`[${timestamp}] HTTP 429 - Rate Limit Exceeded! Blocked by Redis.`, ...prev.slice(0, 9)]);
      } else {
        setSystemLogs(prev => [`[${timestamp}] Connection Error - Is backend running?`, ...prev.slice(0, 9)]);
      }
    }
  };

  const updateChartMetrics = (time, successIncr, failIncr) => {
    setMetrics(prev => {
      // Create a clean, isolated shallow copy of the state array to modify safely
      const updated = [...prev];
      const lastIndex = updated.length - 1;

      // If this exact timestamp millisecond window already exists, aggregate the counters
      if (lastIndex >= 0 && updated[lastIndex].time === time) {
        updated[lastIndex] = {
          ...updated[lastIndex],
          Allowed: updated[lastIndex].Allowed + successIncr,
          Blocked: updated[lastIndex].Blocked + failIncr
        };
        return updated;
      }

      // Otherwise, safely append a fresh time-series bucket and keep the last 15 ticks
      return [...updated, { time, Allowed: successIncr, Blocked: failIncr }].slice(-15);
    });
  };

  // Stress-Testing Loop: Fire 25 rapid requests sequentially to slam the Redis token bucket
  const simulateTrafficSpike = async () => {
    setSystemLogs(prev => [`⚡ Launching paced distributed traffic spike...`, ...prev]);
    // Fire 20 requests to completely exhaust the 10-request rolling window limit
    for (let i = 0; i < 20; i++) {
      fireRequest();
      // Increase pacing delay to 350ms to prevent browser socket saturation
      await new Promise(r => setTimeout(r, 350)); 
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-900 text-slate-100">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-400">FinOps Platform Gateway Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time edge metrics visualization pipeline</p>
      </header>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
          <h3 className="text-sm font-medium text-slate-400 uppercase">Total Inbound Volume</h3>
          <p className="text-4xl font-extrabold mt-2 text-indigo-300">{stats.total}</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
          <h3 className="text-sm font-medium text-slate-400 uppercase text-emerald-400">Successful Processing (HTTP 200)</h3>
          <p className="text-4xl font-extrabold mt-2 text-emerald-400">{stats.success}</p>
        </div>
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-md">
          <h3 className="text-sm font-medium text-slate-400 uppercase text-rose-400">Throttled Outflows (HTTP 429)</h3>
          <p className="text-4xl font-extrabold mt-2 text-rose-400">{stats.throttled}</p>
        </div>
      </div>

      {/* Core Body Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Control Deck */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Load Simulation Desk</h2>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Target Identity Profile</label>
            <input 
              type="text" 
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={fireRequest} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 font-medium rounded-lg transition-colors shadow">
              Execute Single Safe Payload
            </button>
            <button onClick={simulateTrafficSpike} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-4 font-medium rounded-lg transition-colors shadow">
              Simulate Core Traffic Spike (Slam Bucket)
            </button>
          </div>
        </div>

        {/* Live Graphic Telemetry Output */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Live Infrastructure Outflow Logs</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
                <Line type="monotone" dataKey="Allowed" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Blocked" stroke="#f43f5e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Terminal Real-Time Audit Console */}
      <div className="mt-8 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm shadow-inner">
        <h4 className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-sans">Live Distributed Telemetry Console Logs</h4>
        <div className="h-32 overflow-y-auto space-y-1 scrollbar-thin">
          {systemLogs.length === 0 ? <p className="text-slate-600 italic">Awaiting connection events...</p> : 
            systemLogs.map((log, i) => (
              <p key={i} className={log.includes('429') ? 'text-rose-400' : log.includes('⚡') ? 'text-amber-400' : 'text-slate-400'}>{log}</p>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default App;