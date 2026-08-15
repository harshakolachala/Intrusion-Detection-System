import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Cpu, 
  Activity, 
  Lock, 
  Server, 
  Terminal, 
  Eye, 
  Layers, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  Database, 
  Globe, 
  Sparkles,
  BarChart3,
  Radio,
  FileSearch,
  Menu,
  X
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1d]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Branding */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Sentinel<span className="text-blue-500">AI</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 font-mono -mt-1 uppercase">NextGen NIDS</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
              <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Features</button>
              <button onClick={() => scrollToSection('architecture')} className="hover:text-blue-400 transition-colors">Architecture</button>
              <button onClick={() => scrollToSection('federated')} className="hover:text-blue-400 transition-colors">Federated Learning</button>
              <button onClick={() => scrollToSection('xai')} className="hover:text-blue-400 transition-colors">Explainable AI</button>
              <button onClick={() => scrollToSection('tech')} className="hover:text-blue-400 transition-colors">Tech Stack</button>
            </nav>

            {/* Auth CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center space-x-2 border border-blue-400/30"
              >
                <span>Console Access</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d1427] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-slate-300 hover:text-blue-400">Features</button>
            <button onClick={() => scrollToSection('architecture')} className="block w-full text-left py-2 text-slate-300 hover:text-blue-400">Architecture</button>
            <button onClick={() => scrollToSection('federated')} className="block w-full text-left py-2 text-slate-300 hover:text-blue-400">Federated Learning</button>
            <button onClick={() => scrollToSection('xai')} className="block w-full text-left py-2 text-slate-300 hover:text-blue-400">Explainable AI</button>
            <button onClick={() => scrollToSection('tech')} className="block w-full text-left py-2 text-slate-300 hover:text-blue-400">Tech Stack</button>
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
              <button onClick={() => navigate('/login')} className="w-full py-2.5 text-center text-slate-300 bg-slate-800 rounded-xl">Sign In</button>
              <button onClick={() => navigate('/register')} className="w-full py-2.5 text-center bg-blue-600 text-white font-medium rounded-xl">Console Access</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-28 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono tracking-wide uppercase shadow-inner">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Enterprise Network Intrusion Detection System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Autonomous Threat Intelligence & <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Federated Intrusion Detection
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
              SentinelAI secures high-throughput enterprise networks using privacy-preserving federated deep learning, real-time packet inspection, and transparent Explainable AI (XAI).
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 border border-blue-400/30"
              >
                <span>Launch Security Console</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollToSection('architecture')}
                className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
              >
                <Terminal className="w-5 h-5 text-blue-400" />
                <span>View System Architecture</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-blue-400 font-mono">99.8%</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Detection Accuracy</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-cyan-400 font-mono">&lt; 5ms</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Inference Latency</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-indigo-400 font-mono">100%</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Privacy Preserved</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
                <p className="text-3xl font-extrabold text-emerald-400 font-mono">24/7</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Autonomous Monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE SECTION */}
      <section id="architecture" className="py-20 bg-[#0d1427]/60 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-mono text-blue-400 uppercase tracking-widest">Enterprise Design</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white">System Architecture & Pipeline</p>
            <p className="text-slate-400">End-to-end packet processing pipeline built for resilience, throughput, and sub-millisecond threat mitigation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Live Packet Ingestion</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Asynchronous raw packet capture engine parses live TCP/UDP flow statistics, header metadata, and temporal features without packet drop.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Neural Inference Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                PyTorch Deep Neural Network evaluates incoming flow vectors against zero-day signatures, classifying traffic into benign or specific attack vectors.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Autonomous SOC Response</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automated incident generation, real-time WebSocket alerts, and SOC playbook suggestions powered by integrated RAG Threat Intel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEDERATED LEARNING & EXPLAINABLE AI SECTION */}
      <section id="federated" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono uppercase">
                <Lock className="w-3.5 h-3.5" />
                <span>Privacy-Preserving AI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Federated Model Aggregation Across Enterprise Nodes
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Train deep learning models directly across distributed enterprise networks without ever exposing raw network logs or sensitive IP payload data to central servers.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">FedAvg Global Model Sync</h4>
                    <p className="text-xs text-slate-400">Client nodes perform local gradient updates and send encrypted weights to global server.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Zero Data Leakage</h4>
                    <p className="text-xs text-slate-400">Strict GDPR and HIPAA compliance by retaining all packet telemetry locally.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div id="xai" className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Explainable AI (XAI) Attribution</h3>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">SHAP / Feature Impact</span>
              </div>

              <p className="text-xs text-slate-400">
                Transparent decision metrics break down exactly why a packet flow was flagged as malicious.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Flow Packets/s Rate</span>
                    <span className="text-rose-400">+48.2% impact</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>SYN Flag Count</span>
                    <span className="text-amber-400">+24.7% impact</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Average Packet Size</span>
                    <span className="text-emerald-400">-12.1% impact (Benign factor)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK BADGES */}
      <section id="tech" className="py-16 bg-[#0d1427]/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Built With Enterprise Security Technologies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">PyTorch Deep Learning</span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">FastAPI / Python 3.11</span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">React + TypeScript</span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">Tailwind CSS</span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">Flower FL Framework</span>
            <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm">SQLite / SQLAlchemy</span>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-tr from-blue-900/40 via-slate-900 to-cyan-900/40 border border-blue-500/30 shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Secure Your Enterprise Infrastructure?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">Access the real-time SOC monitoring console now to start inspecting network telemetry and live attack vectors.</p>
            <div>
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/25 transition-all inline-flex items-center space-x-3 border border-blue-400/30"
              >
                <span>Access SentinelAI Console</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-12 bg-[#080c17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-xs text-slate-500 font-mono">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>SentinelAI Enterprise Security Engine &copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <span>Federated NIDS Protocol</span>
            <span>Privacy Policy</span>
            <span>API Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;