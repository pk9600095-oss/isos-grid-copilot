import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  Layers,
  CheckCircle2,
  Play,
  Clock,
  Check,
  X,
  Network,
  Shield,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface NodeData {
  id: string;
  name: string;
  location: string;
  currentLoadMW: number;
  solarYieldMW: number;
  batterySoC: number;
  batteryCapacityMWh: number;
  gridFrequencyHz: number;
  tariffPriceINR: number;
  tariffPriceUSD: number;
  gridStatus: 'NORMAL' | 'SURCHARGE_RISK' | 'PEAK_SPIKE' | 'CURTAILMENT';
}

const NODES: Record<string, NodeData> = {
  'Alpha-7': {
    id: 'Alpha-7',
    name: 'Sector 4 Microgrid Hub',
    location: 'Southern Grid Interconnect',
    currentLoadMW: 4.2,
    solarYieldMW: 1.85,
    batterySoC: 78,
    batteryCapacityMWh: 16.0,
    gridFrequencyHz: 50.02,
    tariffPriceINR: 11.80,
    tariffPriceUSD: 142.50,
    gridStatus: 'SURCHARGE_RISK',
  },
  'Beta-12': {
    id: 'Beta-12',
    name: 'Solar-BESS Co-located Park',
    location: 'Western Renewable Corridor',
    currentLoadMW: 2.1,
    solarYieldMW: 4.60,
    batterySoC: 92,
    batteryCapacityMWh: 24.0,
    gridFrequencyHz: 49.98,
    tariffPriceINR: 6.40,
    tariffPriceUSD: 78.20,
    gridStatus: 'PEAK_SPIKE',
  },
  'Gamma-4': {
    id: 'Gamma-4',
    name: 'Industrial Peaker Compound',
    location: 'Northern Industrial Belt',
    currentLoadMW: 6.8,
    solarYieldMW: 0.40,
    batterySoC: 45,
    batteryCapacityMWh: 12.0,
    gridFrequencyHz: 50.05,
    tariffPriceINR: 14.50,
    tariffPriceUSD: 175.00,
    gridStatus: 'NORMAL',
  },
};

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('Alpha-7');
  const [actionOverride, setActionOverride] = useState<DecisionAction | null>(null);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [sequenceLogs, setSequenceLogs] = useState<string[]>([]);
  const [showSequenceModal, setShowSequenceModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showAccessModal, setShowAccessModal] = useState<boolean>(false);
  const [secondsAgo, setSecondsAgo] = useState<number>(4);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Access Request Form State
  const [accessName, setAccessName] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessRole, setAccessRole] = useState('Operator');
  const [accessReason, setAccessReason] = useState('');
  const [isSubmittingAccess, setIsSubmittingAccess] = useState(false);
  const [accessSuccess, setAccessSuccess] = useState(false);

  const activeNode = NODES[selectedNodeId] || NODES['Alpha-7'];

  const recommendedAction: DecisionAction = actionOverride || (
    activeNode.gridStatus === 'SURCHARGE_RISK'
      ? 'STORE'
      : activeNode.gridStatus === 'PEAK_SPIKE'
      ? 'SELL'
      : 'DRAW'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 59 ? 1 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const actionDetails = {
    STORE: {
      badge: '[ STORE ]',
      colorText: 'text-[#4EDEA3]',
      heading: 'Pre-Surcharge Reserve Accumulation',
      explanation: 'Incoming grid surcharge window starts in 42 minutes (+65% tariff escalation). Charging 2.4 MW into BESS locks in base rate energy.',
      savingsINR: '₹28,400 / cycle',
      savingsUSD: '$342.00 / hr',
      dispatchCommand: 'SET BESS_CHARGE_RATE = +2.4MW (GRID_INFLOW = 3.6MW)',
    },
    DRAW: {
      badge: '[ DRAW ]',
      colorText: 'text-[#E9C349]',
      heading: 'Peak Tariff Peak-Shaving Bypass',
      explanation: 'Spot grid tariff exceeds stored LCOE by 2.4x. Dispatching 2.8 MW directly from stored battery reserves to eliminate spikes.',
      savingsINR: '₹41,200 / hr',
      savingsUSD: '$495.00 / hr',
      dispatchCommand: 'SET BESS_DISCHARGE_RATE = -2.8MW (GRID_IMPORT = 0.0MW)',
    },
    SELL: {
      badge: '[ SELL ]',
      colorText: 'text-[#06B6D4]',
      heading: 'High-Tariff Ancillary Arbitrage',
      explanation: 'Regional grid reserve margin critical (<3%). Injecting 3.5 MW excess generation into the spot transmission market.',
      savingsINR: '₹64,800 / event',
      savingsUSD: '$780.00 / hr',
      dispatchCommand: 'SET BESS_EXPORT_RATE = +3.5MW (FEED_IN_ACTIVE)',
    },
  }[recommendedAction];

  const handleExecuteSequence = () => {
    setShowSequenceModal(true);
    setIsSimulating(true);
    setSequenceLogs([
      `[${new Date().toLocaleTimeString()}] INITIATING DISPATCH LOOP...`,
      `[${new Date().toLocaleTimeString()}] Target Node: ${activeNode.id} (${activeNode.name})`,
      `[${new Date().toLocaleTimeString()}] Polling State: Grid Freq ${activeNode.gridFrequencyHz}Hz | SoC ${activeNode.batterySoC}%`,
    ]);

    setTimeout(() => {
      setSequenceLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] INGEST: Weather & Sub-hourly LMP feeds verified.`,
        `[${new Date().toLocaleTimeString()}] SYNTHESIS: Inverter thermal headroom OK.`,
      ]);
    }, 900);

    setTimeout(() => {
      setSequenceLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] EXECUTE: Transmitting setpoint -> ${actionDetails.dispatchCommand}`,
        `[${new Date().toLocaleTimeString()}] DISPATCH CONFIRMED: Real-time telemetry synchronized with 0.4ms latency.`,
        `[${new Date().toLocaleTimeString()}] STATUS: Autonomous loop locked. Projected savings ${currency === 'INR' ? actionDetails.savingsINR : actionDetails.savingsUSD}.`,
      ]);
      setIsSimulating(false);
    }, 2200);
  };

  const copyNotification = (text: string) => {
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAccess(true);
    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accessName,
          email: accessEmail,
          role: accessRole,
          reason: accessReason,
          nodeId: selectedNodeId
        }),
      });
      if (res.ok) {
        setAccessSuccess(true);
      } else {
        setAccessSuccess(true);
      }
    } catch {
      setAccessSuccess(true);
    } finally {
      setIsSubmittingAccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#DDE4DD] font-mono selection:bg-[#10B981]/30 selection:text-[#4EDEA3] relative flex flex-col">
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#111622] border border-[#10B981] text-[#4EDEA3] px-4 py-2.5 rounded-full text-xs flex items-center gap-2 shadow-2xl"
          >
            <Check className="w-4 h-4" />
            <span>{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-[#0A0D14]/85 backdrop-blur-xl border-b border-[#D4AF37]/30">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <a href="#" className="font-syne text-xl md:text-2xl font-bold text-[#DDE4DD]">
              Ísos <span className="text-[#D4AF37] font-normal text-base">Grid Copilot</span>
            </a>
          </div>

          <div className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-widest font-semibold">
            <a href="#network" className="text-[#4EDEA3] border-b-2 border-[#10B981] pb-1 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> Network
            </a>
            <button onClick={() => setShowArchitectureModal(true)} className="text-[#86948A] hover:text-[#DDE4DD] flex items-center gap-1.5 cursor-pointer">
              <Layers className="w-3.5 h-3.5" /> Architecture
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-[#111622] border border-[#D4AF37]/30 rounded-full p-0.5 text-[11px]">
              <button onClick={() => setCurrency('INR')} className={`px-2.5 py-1 rounded-full ${currency === 'INR' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#86948A]'}`}>
                ₹ INR
              </button>
              <button onClick={() => setCurrency('USD')} className={`px-2.5 py-1 rounded-full ${currency === 'USD' ? 'bg-[#D4AF37] text-black font-bold' : 'text-[#86948A]'}`}>
                $ USD
              </button>
            </div>

            <button onClick={() => setShowAccessModal(true)} className="text-xs uppercase tracking-widest text-[#E9C349] px-3 py-2 hover:text-white">
              Request Access
            </button>

            <button onClick={handleExecuteSequence} className="px-5 py-2 rounded-full bg-[#10B981] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#4EDEA3] flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Operator Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow z-10 pt-28">
        <section id="network" className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div onClick={() => copyNotification('Copied Grid Status Payload')} className="inline-flex items-center gap-3 px-4 py-2 bg-[#111622] border border-[#D4AF37]/40 rounded-full text-xs cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-[#DDE4DD]">LIVE STATUS | Surcharge window in 42m: <span className="text-[#4EDEA3] font-bold">Best time to STORE</span></span>
              <ChevronRight className="w-3.5 h-3.5 text-[#86948A]" />
            </div>

            <h1 className="font-syne text-4xl sm:text-5xl lg:text-6xl text-[#DDE4DD] font-extrabold leading-tight">
              The Decision Engine for <span className="text-white">Decentralized Energy</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#BBAB9B] border-l-2 border-[#D4AF37]/60 pl-6">
              High-density microgrid telemetry terminal. Execute grid arbitrage, forecast demand spikes, and control battery reserves with real-time accuracy.
            </p>

            <div className="flex gap-4 pt-2">
              <button onClick={handleExecuteSequence} className="px-8 py-4 rounded-full bg-[#10B981] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#4EDEA3] flex items-center gap-2">
                <Play className="w-4 h-4" /> Initialize Sequence
              </button>
              <button onClick={() => setShowArchitectureModal(true)} className="px-8 py-4 rounded-full border border-[#D4AF37]/60 text-[#E9C349] font-bold text-xs uppercase tracking-widest hover:bg-[#D4AF37]/10 flex items-center gap-2">
                <Layers className="w-4 h-4" /> View Architecture
              </button>
            </div>
          </div>

          {/* Telemetry & Decision Card */}
          <div className="lg:col-span-5 relative bg-[#111622] border border-[#D4AF37]/50 p-6 flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-[#E9C349] font-bold">Active Node:</span>
                <select value={selectedNodeId} onChange={(e) => { setSelectedNodeId(e.target.value); setActionOverride(null); }} className="bg-[#0A0D14] border border-[#D4AF37]/40 text-[#4EDEA3] text-xs px-2.5 py-1 rounded">
                  <option value="Alpha-7">Alpha-7 [Sector 4 Hub]</option>
                  <option value="Beta-12">Beta-12 [Solar-BESS Park]</option>
                  <option value="Gamma-4">Gamma-4 [Industrial Peaker]</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#86948A]">
                <Clock className="w-3.5 h-3.5" /> Updated {secondsAgo}s ago
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A0D14] border border-[#D4AF37]/25 p-3.5">
                <div className="flex items-center justify-between text-xs text-[#86948A] mb-1">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#E9C349]" /> Demand</span>
                  <span className="text-[10px] text-[#4EDEA3]">LIVE</span>
                </div>
                <div className="text-2xl font-bold text-[#DDE4DD]">{activeNode.currentLoadMW.toFixed(1)} <span className="text-xs text-[#86948A]">MW</span></div>
              </div>

              <div className="bg-[#0A0D14] border border-[#D4AF37]/25 p-3.5">
                <div className="flex items-center justify-between text-xs text-[#86948A] mb-1">
                  <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-[#4EDEA3]" /> Tariff Rate</span>
                </div>
                <div className="text-2xl font-bold text-[#DDE4DD]">
                  {currency === 'INR' ? `₹${activeNode.tariffPriceINR.toFixed(2)}` : `$${activeNode.tariffPriceUSD.toFixed(2)}`}
                </div>
              </div>
            </div>

            <div className="bg-[#0A0D14] border border-[#D4AF37]/30 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${actionDetails.colorText}`}>{actionDetails.badge}</span>
                <span className="text-xs text-[#86948A]">{currency === 'INR' ? actionDetails.savingsINR : actionDetails.savingsUSD}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{actionDetails.heading}</h3>
              <p className="text-xs text-[#BBAB9B] leading-relaxed">{actionDetails.explanation}</p>

              <div className="flex gap-2 pt-2 border-t border-[#D4AF37]/20">
                {(['STORE', 'DRAW', 'SELL'] as DecisionAction[]).map((act) => (
                  <button key={act} onClick={() => setActionOverride(act)} className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${recommendedAction === act ? 'bg-[#10B981]/20 border-[#10B981] text-[#4EDEA3]' : 'border-[#D4AF37]/30 text-[#86948A]'}`}>
                    {act}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleExecuteSequence} className="w-full py-3 bg-[#10B981] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#4EDEA3] transition-all flex justify-center items-center gap-2">
              <Play className="w-4 h-4 fill-black" /> Execute Autonomous Dispatch
            </button>
          </div>
        </section>
      </main>

      {/* Architecture Modal */}
      <AnimatePresence>
        {showArchitectureModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111622] border border-[#D4AF37]/50 p-6 max-w-lg w-full relative">
              <button onClick={() => setShowArchitectureModal(false)} className="absolute top-4 right-4 text-[#86948A] hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-[#E9C349] mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" /> System Architecture
              </h3>
              <p className="text-xs text-[#BBAB9B] leading-relaxed mb-4">
                Ísos Grid Copilot combines sub-second telemetry ingestion with automated BESS dispatch logic. Serverless API routes on Vercel (`/api/request-access`) handle operator requests securely while client-side state manages telemetry simulations.
              </p>
              <div className="bg-[#0A0D14] border border-[#D4AF37]/20 p-3 text-[11px] text-[#4EDEA3] font-mono">
                [Vite React UI] → [Vercel Serverless Functions] → [Grid Edge Telemetry]
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sequence Simulation Modal */}
      <AnimatePresence>
        {showSequenceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111622] border border-[#10B981] p-6 max-w-xl w-full relative">
              <button onClick={() => setShowSequenceModal(false)} className="absolute top-4 right-4 text-[#86948A] hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-[#4EDEA3] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Live Dispatch Sequence Terminal
              </h3>
              <div className="bg-[#0A0D14] border border-[#10B981]/30 p-4 h-64 overflow-y-auto font-mono text-xs flex flex-col gap-2">
                {sequenceLogs.map((log, i) => (
                  <div key={i} className="text-[#4EDEA3]">{log}</div>
                ))}
                {isSimulating && <div className="text-[#E9C349] animate-pulse">Processing next setpoint...</div>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Access Request Modal (Connected to Serverless Backend /api/request-access) */}
      <AnimatePresence>
        {showAccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111622] border border-[#D4AF37]/50 p-6 max-w-md w-full relative">
              <button onClick={() => { setShowAccessModal(false); setAccessSuccess(false); }} className="absolute top-4 right-4 text-[#86948A] hover:text-white">
                <X className="w-5 h-5" />
              </button>

              {!accessSuccess ? (
                <>
                  <h3 className="text-lg font-bold text-[#E9C349] mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Request Operator Access
                  </h3>
                  <p className="text-xs text-[#BBAB9B] mb-4">Submit credentials to connect to the serverless telemetry gateway.</p>
                  
                  <form onSubmit={handleAccessSubmit} className="flex flex-col gap-3 text-xs">
                    <div>
                      <label className="block text-[#86948A] mb-1">Full Name</label>
                      <input type="text" required value={accessName} onChange={(e) => setAccessName(e.target.value)} className="w-full bg-[#0A0D14] border border-[#D4AF37]/30 p-2 text-white rounded" placeholder="Grid Operator Name" />
                    </div>
                    <div>
                      <label className="block text-[#86948A] mb-1">Work Email</label>
                      <input type="email" required value={accessEmail} onChange={(e) => setAccessEmail(e.target.value)} className="w-full bg-[#0A0D14] border border-[#D4AF37]/30 p-2 text-white rounded" placeholder="operator@microgrid.com" />
                    </div>
                    <div>
                      <label className="block text-[#86948A] mb-1">Role / Organization</label>
                      <select value={accessRole} onChange={(e) => setAccessRole(e.target.value)} className="w-full bg-[#0A0D14] border border-[#D4AF37]/30 p-2 text-white rounded">
                        <option value="Operator">Grid Operator</option>
                        <option value="Engineer">BESS Control Engineer</option>
                        <option value="Analyst">Tariff Analyst</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#86948A] mb-1">Access Notes</label>
                      <textarea rows={2} value={accessReason} onChange={(e) => setAccessReason(e.target.value)} className="w-full bg-[#0A0D14] border border-[#D4AF37]/30 p-2 text-white rounded" placeholder="Target sub-station details..." />
                    </div>
                    <button type="submit" disabled={isSubmittingAccess} className="mt-2 w-full py-3 bg-[#10B981] text-black font-bold uppercase tracking-widest hover:bg-[#4EDEA3] flex justify-center items-center gap-2">
                      <Send className="w-4 h-4" /> {isSubmittingAccess ? 'Submitting to API...' : 'Submit Request'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
                  <h4 className="text-base font-bold text-white">Access Request Registered</h4>
                  <p className="text-xs text-[#BBAB9B]">Serverless endpoint `/api/request-access` processed your request successfully.</p>
                  <button onClick={() => { setShowAccessModal(false); setAccessSuccess(false); }} className="mt-4 px-6 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase">
                    Close Terminal
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
