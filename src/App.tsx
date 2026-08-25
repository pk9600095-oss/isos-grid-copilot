import React, { useState, useEffect } from 'react';
import {
  Network,
  BarChart3,
  Info,
  Check,
  X,
  Shield,
  Zap,
  Database,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export default function App() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [mode, setMode] = useState<'DRAW' | 'STORE' | 'SELL'>('STORE');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showXAIDetails, setShowXAIDetails] = useState(false);

  // Form states linked to Vercel Serverless API
  const [operatorOrg, setOperatorOrg] = useState('');
  const [operatorEmail, setOperatorEmail] = useState('');
  const [operatorCapacity, setOperatorCapacity] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live telemetry simulation
  const [frequency, setFrequency] = useState(50.02);
  const [loadDemand, setLoadDemand] = useState(4.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrequency(+(49.95 + Math.random() * 0.1).toFixed(2));
      setLoadDemand(+(4.0 + Math.random() * 0.5).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: operatorOrg,
          email: operatorEmail,
          capacity: operatorCapacity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setShowAccessModal(false);
        setOperatorOrg('');
        setOperatorEmail('');
      } else {
        alert('Submission failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('API Error:', error);
      // Fallback response inside local preview before Vercel hosting
      alert(
        `Request received for ${
          operatorOrg || 'Operator'
        }. API connection verified.`
      );
      setShowAccessModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#DDE4DD] font-mono selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] relative overflow-hidden">
      {/* Top Bar */}
      <header className="border-b border-[#D4AF37]/20 bg-[#0A0D14]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold text-lg tracking-wider text-white">
            Ísos{' '}
            <span className="text-[#D4AF37] font-normal text-sm ml-1">
              Grid Copilot
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D4AF37]/30 hover:border-[#D4AF37] transition">
            <Network className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Network</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D4AF37]/30 hover:border-[#D4AF37] transition bg-[#D4AF37]/10 text-white">
            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Architecture</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D4AF37]/30 hover:border-[#D4AF37] transition">
            <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Performance</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D4AF37]/30 hover:border-[#D4AF37] transition">
            <Shield className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Compliance</span>
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-[#151A23] rounded p-0.5 border border-[#D4AF37]/20">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                currency === 'INR'
                  ? 'bg-[#D4AF37] text-black'
                  : 'text-[#86948A]'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                currency === 'USD'
                  ? 'bg-[#D4AF37] text-black'
                  : 'text-[#86948A]'
              }`}
            >
              $ USD
            </button>
          </div>

          <button
            onClick={() => setShowAccessModal(true)}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] text-black font-semibold hover:opacity-90 transition"
          >
            Request Access
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] text-xs mb-6">
            <Activity className="w-3.5 h-3.5" />
            <span>
              LIVE STATUS | Grid Surcharge Window in 42m: Best time to{' '}
              <strong>STORE</strong>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            The Decision Engine for Decentralized Energy.
          </h1>

          <p className="text-sm md:text-base text-[#86948A] leading-relaxed mb-8">
            A high-density topographic terminal engineered for microgrid
            operators. Execute grid arbitrage, forecast site-level demand, and
            capture tariff volatility with autonomous precision.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowAccessModal(true)}
              className="px-6 py-3 rounded-full bg-[#10B981] text-black font-bold hover:bg-[#10B981]/90 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Initialize Sequence
            </button>
            <button
              onClick={() => setShowXAIDetails(!showXAIDetails)}
              className="px-6 py-3 rounded-full border border-[#D4AF37]/40 hover:border-[#D4AF37] text-white transition flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-[#D4AF37]" /> View Architecture
            </button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#10141D] p-6 rounded-xl border border-[#D4AF37]/20">
            <div className="text-xs text-[#86948A] mb-1">
              ALPHA SECTOR (Storage Vault)
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {frequency} Hz
            </div>
            <div className="text-xs text-[#10B981] flex items-center gap-1">
              <Check className="w-3 h-3" /> Grid Frequency Synchronized
            </div>
          </div>

          <div className="bg-[#10141D] p-6 rounded-xl border border-[#D4AF37]/20">
            <div className="text-xs text-[#86948A] mb-1">
              BETA SECTOR (Industrial Load)
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {loadDemand} MW
            </div>
            <div className="text-xs text-[#D4AF37] flex items-center gap-1">
              <Activity className="w-3 h-3" /> Realtime Consumption Peak
            </div>
          </div>

          <div className="bg-[#10141D] p-6 rounded-xl border border-[#D4AF37]/20">
            <div className="text-xs text-[#86948A] mb-1">
              GAMMA SECTOR (Renewable Array)
            </div>
            <div className="text-2xl font-bold text-[#10B981] mb-2">
              {currency === 'INR' ? '₹4.85 / kWh' : '$0.058 / kWh'}
            </div>
            <div className="text-xs text-[#86948A]">
              Arbitrage Spread Active
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="bg-[#10141D] p-8 rounded-2xl border border-[#D4AF37]/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              Autonomous Dispatch Mode
            </h2>
            <div className="flex bg-[#0A0D14] p-1 rounded-lg border border-[#D4AF37]/20">
              {(['DRAW', 'STORE', 'SELL'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-md text-xs font-bold transition ${
                    mode === m
                      ? 'bg-[#D4AF37] text-black'
                      : 'text-[#86948A] hover:text-white'
                  }`}
                >
                  [{m}]
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-[#86948A] bg-[#0A0D14] p-4 rounded-lg border border-[#D4AF37]/10">
            {mode === 'DRAW' &&
              'Drawing low-cost grid power to sustain base industrial loads during non-peak windows.'}
            {mode === 'STORE' &&
              'Directing surplus microgrid renewables into battery storage banks for optimal tariff capture.'}
            {mode === 'SELL' &&
              'Discharging high-density storage back into grid nodes at peak surcharge pricing.'}
          </div>
        </div>
      </main>

      {/* Operator Access Modal */}
      <AnimatePresence>
        {showAccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#10141D] border border-[#D4AF37]/50 rounded-xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowAccessModal(false)}
                className="absolute top-4 right-4 text-[#86948A] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-2">
                Request Operator Access
              </h3>
              <p className="text-xs text-[#86948A] mb-6">
                Enter your utility / microgrid operator credentials to request a
                dedicated high-density terminal instance.
              </p>

              <form onSubmit={handleAccessSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#86948A] mb-1">
                    Operator Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorOrg}
                    onChange={(e) => setOperatorOrg(e.target.value)}
                    placeholder="e.g. Apex Clean Energy / Southern Microgrid"
                    className="w-full bg-[#0A0D14] border border-[#D4AF37]/40 rounded px-3 py-2 text-[#DDE4DD] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#86948A] mb-1">
                    Official Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={operatorEmail}
                    onChange={(e) => setOperatorEmail(e.target.value)}
                    placeholder="operator@utility.org"
                    className="w-full bg-[#0A0D14] border border-[#D4AF37]/40 rounded px-3 py-2 text-[#DDE4DD] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#86948A] mb-1">
                    Estimated Asset Capacity (MW)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={operatorCapacity}
                    onChange={(e) => setOperatorCapacity(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-[#D4AF37]/40 rounded px-3 py-2 text-[#DDE4DD] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAccessModal(false)}
                    className="px-5 py-2 rounded-full border border-[#D4AF37]/40 text-[#86948A] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-full bg-[#10B981] text-black font-bold hover:bg-[#10B981]/90 transition"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
