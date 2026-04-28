import { useState } from "react";
import { Link } from "react-router-dom";
import bridgeHomeImg from "../assets/bridgeboard_home.png";

const isStaticDeploy = import.meta.env.VITE_DEPLOY_TARGET === "pages";

// Replace this with your actual YouTube video ID after uploading.
const YOUTUBE_VIDEO_ID = "897nXqaD3d8";
const GITHUB_URL = "https://github.com/cjoewono/bridgeboard";

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="min-h-[90vh] flex items-start justify-center">
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
              </span>{" "}
              is the mission control for your civilian career. Organize
              applications, manage network contacts, and secure your next rank
              in tech.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-5">
              {isStaticDeploy ? (
                <>
                  <a
                    href="#demo"
                    onClick={scrollToSection("demo")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95 text-center"
                  >
                    Watch Live Demo
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-slate-200 hover:border-slate-400 text-slate-700 px-10 py-4 rounded-xl font-bold text-lg transition-all text-center"
                  >
                    View on GitHub
                  </a>
                </>
              ) : (
                <>
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
                </>
              )}
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
                                    ${isLoaded ? "opacity-100" : "opacity-0"}
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
      </section>

      {/* The portfolio sections below only render in static deploy mode. */}
      {isStaticDeploy && (
        <>
          {/* DEMO VIDEO */}
          <section
            id="demo"
            className="bg-slate-50 border-y border-slate-100 py-24 px-6"
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-100 px-4 py-1.5 rounded-md mb-4">
                  Live Walkthrough
                </span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                  See <span className="text-blue-600">Bridge</span>Board in
                  action
                </h2>
                <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                  A full end-to-end Cypress run covering registration,
                  dashboard, MOS translation, job search, and contact
                  management.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
                  title="BridgeBoard Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>

              <p className="text-center mt-6 text-sm text-slate-400 font-medium">
                Cypress E2E demo · 7 test suites · 1.8x playback for narration
                pacing
              </p>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="py-24 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-md mb-4">
                  Core Features
                </span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                  Built for the transition mission
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* MOS Translator */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                    <span className="text-2xl">🎖️</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                    MOS Translator
                  </h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    AI-powered translation of any military specialty code into
                    civilian-ready job titles, transferable skills, and ATS
                    keywords.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Example
                    </p>
                    <p className="text-sm font-bold text-slate-900">Army 11B</p>
                    <div className="h-px w-8 bg-blue-200 my-2"></div>
                    <p className="text-sm font-semibold text-blue-600">
                      → Operations Manager
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      → Team Lead
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      → Security Specialist
                    </p>
                  </div>
                </div>

                {/* Job Tracker */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                    Application Tracker
                  </h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    Centralized dashboard for every job application — status,
                    tasks, interview notes, and Adzuna-powered job search built
                    in.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Lockheed Martin
                      </span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        Interviewing
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Anduril
                      </span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        Applied
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Palantir
                      </span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Offer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contacts */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                    Networking Contacts
                  </h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    Track every recruiter, mentor, and referral. Notes,
                    companies, and emails — all in one place, never lost in your
                    inbox.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        JS
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Jordan Smith
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          Recruiter · Anduril
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TECH STACK */}
          <section
            id="stack"
            className="bg-slate-50 border-y border-slate-100 py-24 px-6"
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-100 px-4 py-1.5 rounded-md mb-4">
                  Engineering
                </span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                  Built end-to-end
                </h2>
                <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                  Production-grade architecture: containerized services,
                  server-side API key isolation, full E2E test coverage.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <StackCard
                  title="Frontend"
                  items={[
                    "React 19",
                    "Vite",
                    "React Router DOM",
                    "Tailwind CSS v4",
                    "Axios",
                  ]}
                />
                <StackCard
                  title="Backend"
                  items={[
                    "Django 6",
                    "Django REST Framework",
                    "Token Authentication",
                    "Gunicorn",
                    "PostgreSQL 15",
                  ]}
                />
                <StackCard
                  title="Infrastructure"
                  items={[
                    "Docker Compose",
                    "Nginx (reverse proxy)",
                    "3-container architecture",
                  ]}
                />
                <StackCard
                  title="Integrations & Testing"
                  items={[
                    "Google Gemini 2.5 Flash",
                    "Adzuna Jobs API (server-proxied)",
                    "Jest + React Testing Library",
                    "Cypress E2E (7 suites)",
                  ]}
                />
              </div>
            </div>
          </section>

          {/* HONEST FOOTER */}
          <section className="py-20 px-6 bg-white">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
                About this deployment
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed mb-8">
                This page is a static showcase deployed to GitHub Pages. The
                full BridgeBoard application — Django REST API, PostgreSQL,
                server-side Adzuna and Gemini integrations — runs locally via
                Docker Compose. See the README for setup, or watch the demo
                above for a complete end-to-end walkthrough.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  View Source on GitHub
                </a>
                <a
                  href={`${GITHUB_URL}#how-to-guide`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-slate-200 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-xl font-bold transition-all"
                >
                  Read Setup Guide
                </a>
              </div>
              <p className="mt-12 text-xs font-medium uppercase tracking-widest text-slate-400">
                Built by Cal Joewono · Code Platoon Capstone
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

const StackCard = ({ title, items }) => (
  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">
      {title}
    </p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-3 text-slate-700 font-semibold"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default HomePage;
