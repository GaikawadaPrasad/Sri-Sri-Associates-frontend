import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Shield, TrendingUp, ArrowRight, CheckCircle, Clock, ChevronRight, BarChart } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Building2 className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-slate-900 font-black text-sm uppercase tracking-widest leading-none">Sri Sri</h1>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-[0.2em] mt-0.5">Associates</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Services</a>
            <a href="#benefits" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Why Us</a>
            <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">
              Client Portal
            </Link>
            <Link to="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2">
              Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-blue-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-indigo-100/40 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Premium Financial Services</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                Elevating your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  financial future.
                </span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                Comprehensive loan management, strategic consulting, and real-time financial tracking built exclusively for high-growth enterprises and individuals.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
                <Link to="/login" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2 active:scale-95">
                  Access Portal <ChevronRight size={18} />
                </Link>
                <a href="#services" className="px-8 py-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95">
                  Explore Services
                </a>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] transform rotate-3 scale-105 opacity-10 blur-xl"></div>
              <div className="relative bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Disbursed</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">₹42.5 Cr</h3>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
                
                {/* Dummy Chart */}
                <div className="space-y-4">
                  {[75, 45, 90, 60, 85].map((height, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 text-xs font-bold text-slate-400 text-right">Q{i+1}</div>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${height}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-2">Our Expertise</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Tailored solutions for your business.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Building2, title: "Loan Management", desc: "End-to-end processing of commercial and personal loans with unparalleled speed." },
              { icon: Shield, title: "Risk Assessment", desc: "Comprehensive risk analysis and insurance advisory to secure your assets." },
              { icon: BarChart, title: "Financial Tracking", desc: "Real-time dashboards and EMI calculators to keep your finances in check." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                  <service.icon size={28} className="text-slate-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">{service.title}</h4>
                <p className="text-slate-600 font-medium leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to streamline your financial operations?
          </h2>
          <p className="text-lg text-slate-300 mb-10 font-medium max-w-2xl mx-auto">
            Join hundreds of clients who trust Sri Sri Associates to manage their financial portfolio with precision and security.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95">
              Access Client Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white" size={16} />
                </div>
                <h1 className="text-white font-black text-sm uppercase tracking-widest leading-none">Sri Sri Associates</h1>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                Empowering businesses and individuals with strategic financial solutions, reliable loan management, and comprehensive consulting.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Client Login</Link></li>
                <li><Link to="/signup" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Agent Registration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs font-medium">© {new Date().getFullYear()} Sri Sri Associates. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-slate-500 text-xs font-medium"><Clock size={14} /> 24/7 Support for Clients</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
