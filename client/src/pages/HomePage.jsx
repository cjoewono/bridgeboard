import { useState } from "react";
import { Link } from "react-router-dom";
import bridgeHomeImg from "../assets/bridgeboard_home.png";

const HomePage = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <main className="min-h-[90vh] flex items-start justify-center bg-white">
            <div className="max-w-7xl mx-auto px-6 pt-6 pb-12 lg:pt-10 lg:pb-16 lg:flex items-center gap-20">
                <div className="lg:w-1/2 text-left mb-16 lg:mb-0">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-md mb-8">
                        Built for veterans in transition
                    </span>
                    
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
                        Track your path <br />
                        from <span className="text-blue-600">service</span> to career
                    </h1>
                    <p className="mt-8 text-xl text-slate-500 max-w-lg leading-relaxed">
                        <span className="font-bold text-slate-950">
                            <span className="text-blue-600">Bridge</span>Board
                        </span> is the mission control for your civilian career. 
                        Organize applications, manage network contacts, and secure your next rank in tech.
                    </p>
                    
                    <div className="mt-12 flex flex-col sm:flex-row gap-5">
                        <Link 
                            to="/register" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 text-center"
                        >
                            Start Your Transition
                        </Link>
                        <Link 
                            to="/login" 
                            className="border-2 border-slate-200 hover:border-slate-400 text-slate-700 px-10 py-4 rounded-xl font-bold text-lg transition-all text-center"
                        >
                            Member Login
                        </Link>
                    </div>
                    
                    <div className="mt-12 flex items-center gap-3 text-slate-400">
                        <div className="h-px w-8 bg-slate-200"></div>
                        <span className="text-sm font-medium uppercase tracking-widest">
                            Secure • Organized • Mission-First
                        </span>
                    </div>
                </div>

                <div className="lg:w-1/2 relative">
                    <div className="relative rounded-3xl overflow-visible bg-slate-100 aspect-[4/3] shadow-2xl">
                        <img 
                            src={bridgeHomeImg} 
                            alt="Professional architectural bridge transition" 
                            fetchpriority="high"
                            loading="eager"
                            onLoad={() => setIsLoaded(true)}
                            className={`
                                rounded-3xl object-cover w-full h-full transition-opacity duration-700 ease-in-out
                                ${isLoaded ? 'opacity-100' : 'opacity-0'}
                            `}
                        />
                
                        <div className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-100 min-w-[240px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                    System Status
                                </p>
                            </div>
                            <p className="text-2xl font-black text-slate-900 mb-1">
                                Active Duty
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                                12 Career Applications Tracked
                            </p>
                        </div>
                        <div className="absolute -top-6 -right-6 h-24 w-24 bg-blue-600/5 rounded-full blur-3xl"></div>
                    </div>
                </div>
                
            </div>
        </main>
    );
};

export default HomePage;