"use client";

import Link from "next/link";
import {
  Camera,
  Mic,
  Shield,
  ChevronRight,
  Star,
  Smartphone,
  Monitor,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Screenshot Analysis",
    description:
      "Take a screenshot of any app and our AI instantly identifies every button, menu, and option on screen.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: CheckCircle2,
    title: "Step-by-Step Guidance",
    description:
      'Get clear, simple instructions like "Tap the blue Send button in the top right corner."',
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Mic,
    title: "Voice Read-Aloud",
    description:
      "Have instructions read out loud so you can follow along without squinting at the screen.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Shield,
    title: "Scam Detection",
    description:
      "TechBuddy automatically warns you if a screenshot looks suspicious or like a scam attempt.",
    color: "bg-red-100 text-red-600",
  },
];

const steps = [
  { num: "1", text: "Take a screenshot of the confusing app screen" },
  { num: "2", text: "Upload it to TechBuddy with one tap" },
  { num: "3", text: "Read or listen to your personalized instructions" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-[var(--font-inter)]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-black text-base md:text-lg">T</span>
              </div>
              <span className="text-xl md:text-2xl font-black text-gray-900">
                Tech<span className="text-blue-600">Buddy</span>
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/demo"
                className="hidden sm:inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm md:text-base transition-colors"
              >
                Try Demo
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm md:text-base transition-all shadow-md hover:shadow-lg"
              >
                Get Help Now
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 md:mb-8">
              <Star className="w-4 h-4 fill-blue-500" />
              Trusted by seniors across the country
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight mb-6">
              Technology Help,{" "}
              <span className="text-blue-600">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12">
              Confused by an app? Just upload a screenshot. TechBuddy&apos;s AI
              tells you exactly what to tap, click, or press — in plain English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                <Camera className="w-6 h-6" />
                Upload Screenshot Now
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                See How It Works
              </a>
            </div>
            {/* Device icons */}
            <div className="flex items-center justify-center gap-6 mt-10 md:mt-14 text-gray-400">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Smartphone className="w-5 h-5" />
                iPhone &amp; Android
              </div>
              <span>·</span>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Monitor className="w-5 h-5" />
                PC &amp; Mac
              </div>
              <span>·</span>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="w-5 h-5" />
                Scam Safe
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto">
                Three simple steps to get help with any app
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl md:text-4xl font-black mb-6 shadow-xl group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto">
                Built specifically for people who want clear, simple tech help
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 ${f.color} rounded-2xl flex items-center justify-center mb-5`}
                  >
                    <f.icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-gray-900 mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Ready to Get Help?
            </h2>
            <p className="text-lg md:text-2xl text-blue-100 mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed">
              Upload your first screenshot for free. No account required.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-3 bg-white hover:bg-blue-50 text-blue-700 font-black text-xl md:text-2xl px-10 py-5 md:px-14 md:py-6 rounded-2xl shadow-2xl hover:shadow-white/20 transition-all"
            >
              <Camera className="w-7 h-7" />
              Try TechBuddy Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="text-white font-black text-lg">
              Tech<span className="text-blue-400">Buddy</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 TechBuddy. Built with ❤️ to help everyone navigate technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
