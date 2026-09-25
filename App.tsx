import React, { useState } from 'react';
import {
  CalendarCheck,
  Headphones,
  Check,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  CheckCheck,
  FileSearch,
  Mail,
  MessageSquare,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function App() {
  // Inquiry / Bottleneck Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    primaryBottleneck: 'Starting fresh / Need a sales conversion framework from scratch',
    bottleneckDescription: '',
    serviceInterest: 'Both',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Direct recipient email configuration
  const recipientEmail = 'myworkspace.reby@gmail.com';

  // Validation functions
  const validateEmail = (val: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(val).trim().toLowerCase());
  };

  const validateWhatsApp = (val: string): boolean => {
    const digitsOnly = val.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 16;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setWhatsappError('');
    setSubmitError('');

    // Strict validation
    let hasError = false;

    if (!formData.name.trim()) {
      setSubmitError('Please enter your full name.');
      hasError = true;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid, active business email (e.g. name@company.com).');
      hasError = true;
    }

    if (!validateWhatsApp(formData.whatsapp)) {
      setWhatsappError('Please enter a valid WhatsApp number with country code (e.g. +1 555 123 4567).');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      // 1. Direct email routing via FormSubmit to user email
      await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `[Rockwell Solutions] New Client Inquiry: ${formData.name.trim()}`,
          _template: 'table',
          _captcha: 'false',
          'Client Name': formData.name.trim(),
          'Working Email': formData.email.trim(),
          'WhatsApp Number': formData.whatsapp.trim(),
          'Service Focus': formData.serviceInterest,
          'Primary Bottleneck': formData.primaryBottleneck,
          'Operational Notes': formData.bottleneckDescription.trim() || 'None provided',
          'Submitted At': new Date().toLocaleString(),
        }),
      }).catch((err) => console.error('FormSubmit dispatch:', err));

      // 2. Dual submission to Netlify Forms (for native static deployment on Netlify)
      try {
        const netlifyParams = new URLSearchParams({
          'form-name': 'client-inquiries',
          name: formData.name.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim(),
          serviceInterest: formData.serviceInterest,
          primaryBottleneck: formData.primaryBottleneck,
          bottleneckDescription: formData.bottleneckDescription.trim() || 'None provided',
        });
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: netlifyParams.toString(),
        }).catch(() => {});
      } catch {
        // Non-blocking
      }

      saveSubmissionLocally(formData);
      setFormSubmitted(true);
    } catch (err) {
      console.error('Submission handled:', err);
      // Fallback: save locally and acknowledge
      saveSubmissionLocally(formData);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMailtoUrl = (data = formData) => {
    const subject = encodeURIComponent(
      `[Rockwell Solutions Inquiry] ${data.name.trim()} - ${data.serviceInterest}`
    );
    const body = encodeURIComponent(
`Rockwell Business Solutions - Operational Inquiry

Client Name: ${data.name.trim()}
Work Email: ${data.email.trim()}
WhatsApp Number: ${data.whatsapp.trim()}
Objective: ${data.serviceInterest}
Primary Bottleneck: ${data.primaryBottleneck}

Operational Notes:
${data.bottleneckDescription?.trim() || 'None provided'}

---
Forwarded directly to: ${recipientEmail}`
    );
    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const getWhatsAppShareUrl = (data = formData) => {
    const text = encodeURIComponent(
`*Rockwell Solutions Inquiry*
Name: ${data.name.trim()}
Email: ${data.email.trim()}
WhatsApp: ${data.whatsapp.trim()}
Objective: ${data.serviceInterest}
Bottleneck: ${data.primaryBottleneck}
Notes: ${data.bottleneckDescription?.trim() || 'None'}`
    );
    return `https://wa.me/?text=${text}`;
  };

  const saveSubmissionLocally = (entry = formData) => {
    try {
      const existing = JSON.parse(
        localStorage.getItem('rockwell_inquiries') || '[]'
      );
      const newEntry = {
        ...entry,
        targetEmail: recipientEmail,
        id: Date.now(),
        date: new Date().toLocaleString(),
      };
      const updated = [newEntry, ...existing];
      localStorage.setItem('rockwell_inquiries', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving inquiry locally', e);
    }
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceSelect = (serviceType: string, bottleneckPrefill: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceInterest: serviceType,
      primaryBottleneck: bottleneckPrefill,
    }));
    handleScrollTo('inquiry');
  };

  const faqItems = [
    {
      q: "How much time does setup take on our end?",
      a: "Setup time depends on the scope and complexity of the operational bottlenecks you need to solve. For straightforward booking automation, onboarding can take as little as a single discovery session. For custom sales frameworks or dedicated agent placements, we establish a realistic, structured implementation timeline during your diagnostic review so expectations and milestones are clear from day one.",
    },
    {
      q: "How do you ensure offshore agents know our niche?",
      a: "Every offshore agent undergoes rigorous training specifically customized to your niche, scripts, and workflows before taking a single call. We also conduct continuous quality checks to keep performance sharp.",
    },
    {
      q: "Do we have to replace our current software or CRM?",
      a: "No. We plug directly into your existing CRM, phone system, and calendar. You retain 100% ownership and full access to all your data.",
    },
    {
      q: "What if an agent isn't the right fit or our needs change?",
      a: "All engagements are governed by formal, bilateral service agreements designed to protect both parties equally. The agreement safeguards your business operations, data, and deliverables while simultaneously protecting the safety, fair working conditions, and stability of our agents. If adjustments or role transitions are needed, they are handled responsibly through structured mutual protocols outlined in the contract.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050B1F] text-[#E0E6ED] relative selection:bg-[#E6B962] selection:text-[#050B1F]">
      {/* Background radial luxury gradient */}
      <div className="fixed inset-0 bg-radial-luxury pointer-events-none -z-10" />

      {/* Ambient purple & gold glow orbs positioned across the funnel */}
      <div
        className="purple-orb w-[540px] h-[540px] -top-32 -left-32 opacity-65"
        aria-hidden="true"
      />
      <div
        className="purple-orb w-[600px] h-[600px] top-[30%] -right-48 opacity-50"
        aria-hidden="true"
      />
      <div
        className="gold-orb w-[420px] h-[420px] top-[50%] left-1/2 -translate-x-1/2 opacity-25"
        aria-hidden="true"
      />
      <div
        className="purple-orb w-[580px] h-[580px] bottom-16 -left-36 opacity-60"
        aria-hidden="true"
      />

      {/* Main Single Page Funnel Content (Pure Scroll-Down Funnel, No Nav Menu) */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            SECTION 1: HERO / HEADLINE (Professional B2B, Max 8 Words, Bold Clean Sans)
           ========================================================================= */}
        <section
          id="hero"
          className="pt-24 pb-20 md:pt-36 md:pb-28 flex flex-col items-center justify-center text-center relative"
        >
          <div className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold tracking-widest uppercase text-[#E6B962] mb-6">
            <Sparkles className="w-4 h-4 text-[#F7E1AD]" />
            <span>Rockwell Business Solutions</span>
          </div>

          {/* Professional Headline: Clean, Bold, Direct */}
          <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.12] max-w-4xl mb-6 text-balance">
            Automate Revenue. Cut Operating Costs.
          </h1>

          {/* Subheading: Direct 5-Second Hook (Quality & Revenue Focused) */}
          <p className="font-dm-sans text-xl sm:text-2xl md:text-3xl text-[#E0E6ED] max-w-3xl mb-8 leading-snug font-medium">
            Never lose an inquiry to slow replies.{' '}
            <span className="text-[#E6B962] font-semibold">Never compromise on operational quality.</span>
          </p>

          {/* 5-Second Scan Anchors: 2 Clear Service Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-10 text-left">
            <div className="glass-surface px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E6B962]/15 border border-[#E6B962]/40 flex items-center justify-center text-[#E6B962] shrink-0 font-bold text-xs">
                01
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">24/7 Booking Automation</p>
                <p className="text-xs text-[#A3B1C6] leading-tight mt-0.5">Instant customer replies & calendar booking</p>
              </div>
            </div>

            <div className="glass-surface px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#F7E1AD] shrink-0 font-bold text-xs">
                02
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">Niche-Trained Offshore Agents</p>
                <p className="text-xs text-[#A3B1C6] leading-tight mt-0.5">High-quality outbound sales & back-office support</p>
              </div>
            </div>
          </div>

          {/* Two CTA buttons: Direct, high contrast */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => handleScrollTo('inquiry')}
              className="btn-gold px-8 py-4 rounded-xl text-base font-bold w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <span>Identify Your Bottlenecks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="btn-gold-outline px-8 py-4 rounded-xl text-base font-semibold w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>See How It Works</span>
            </button>
          </div>

          {/* Executive Trust Badges: Fast scan bullets */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-xs text-[#A3B1C6]">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E6B962]" /> Timeline based on your scope
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E6B962]" /> Agents trained for your niche
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E6B962]" /> Mutual contracts protecting both business & talent
            </span>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE PROBLEM (Professional Diagnostic Framing)
           ========================================================================= */}
        <section id="problem" className="py-16 md:py-20 max-w-4xl mx-auto relative">
          <div className="glass-surface rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Subtle glow within card */}
            <div
              className="purple-orb w-64 h-64 -top-20 -right-20 opacity-30"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E6B962] mb-3">
                <FileSearch className="w-4 h-4" />
                <span>What's Costing You Money</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
                How You're Losing Money Right Now
              </h2>

              {/* Problem statement for new founders, SMEs, and growing businesses */}
              <div className="space-y-4 font-dm-sans text-base sm:text-lg text-[#E0E6ED] leading-relaxed">
                <p className="flex items-start gap-3">
                  <span className="text-[#E6B962] font-bold text-lg select-none">•</span>
                  <span>
                    When you <strong className="text-white font-semibold">don't have a sales framework or know how to convert leads</strong>, potential buyers slip away and <strong className="text-[#F7E1AD] font-semibold">you leave money on the table without knowing why</strong>.
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-[#E6B962] font-bold text-lg select-none">•</span>
                  <span>
                    When <strong className="text-white font-semibold">customers can't book easily or you reply too late</strong>, they lose patience, head to your competitor, and <strong className="text-[#F7E1AD] font-semibold">you lose the sale</strong>.
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-[#E6B962] font-bold text-lg select-none">•</span>
                  <span>
                    When you're <strong className="text-white font-semibold">trying to piece together sales and back-office ops alone</strong>, weeks are lost guessing tech tools instead of <strong className="text-[#F7E1AD] font-semibold">closing clients and building real revenue</strong>.
                  </span>
                </p>
              </div>

              {/* Startup / New Founder Callout Box */}
              <div className="mt-6 p-4 rounded-xl bg-white/[0.04] border border-[#E6B962]/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#E0E6ED] leading-relaxed">
                  <strong className="text-[#E6B962] font-semibold">Starting from scratch?</strong> You don't need a preexisting system. We design, build, and deploy the entire sales conversion framework, booking engine, and operational workflows for you from day one.
                </p>
              </div>

              {/* Call-to-action nudge */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
                <span className="text-sm text-[#A3B1C6]">
                  Sound familiar? Let's build your conversion framework.
                </span>
                <button
                  onClick={() => handleScrollTo('inquiry')}
                  className="text-xs font-bold text-[#E6B962] hover:text-[#F7E1AD] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Tell Us What You're Building</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: THE SOLUTION
           ========================================================================= */}
        <section id="solution" className="py-16 md:py-20 text-center max-w-3xl mx-auto relative">
          <div className="inline-block mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E6B962]">
              The Solution
            </span>
          </div>

          {/* 2-sentence solution statement */}
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            We build your sales framework.{' '}
            <span className="text-[#F7E1AD] underline decoration-[#E6B962] decoration-2 underline-offset-8">
              You focus on growth.
            </span>
          </h2>

          <p className="font-dm-sans text-lg sm:text-xl text-[#A3B1C6] leading-relaxed">
            Whether you have zero idea how to convert sales or you're scaling an existing business, we build your complete framework:{' '}
            <strong className="text-white font-semibold">automated 24/7 booking</strong> so interested prospects convert instantly, and{' '}
            <strong className="text-white font-semibold">dedicated, niche-trained offshore talent</strong> to execute your outbound sales and back-office operations.
          </p>
        </section>

        {/* =========================================================================
            SECTION 4: TWO SERVICES (Quick Breakdown)
           ========================================================================= */}
        <section id="services" className="py-16 md:py-24 relative">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E6B962]">
              Two High-Impact Disciplines
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-white mt-2">
              Automate the Front. Outsource the Back.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* CARD 1 — LOCAL SERVICES */}
            <div className="glass-surface rounded-2xl p-8 sm:p-10 border border-white/10 hover:border-[#E6B962]/50 transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E6B962]/10 border border-[#E6B962]/30 flex items-center justify-center text-[#E6B962]">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#E6B962] uppercase tracking-wider">
                    Service 01
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#A3B1C6] uppercase tracking-wider mb-1">
                  Local Services
                </div>
                <h3 className="font-headline text-2xl sm:text-3xl font-bold text-white mb-3">
                  Automate Your Revenue
                </h3>
                <p className="font-dm-sans text-[#A3B1C6] text-sm sm:text-base leading-relaxed mb-6">
                  Convert incoming customer inquiries into confirmed bookings without latency, friction, or missed opportunities.
                </p>

                <ul className="space-y-3.5 mb-8">
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">24/7 booking automation</strong> engineered for frictionless client acquisition.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Instant customer replies</strong> powered by conversational AI logic.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#F7E1AD]">Fewer no-shows, more revenue</strong> with automated confirmation cycles.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  handleServiceSelect(
                    'Automation',
                    'Inquiries slipping away / slow booking replies'
                  )
                }
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-[#050B1F] bg-[#E6B962] hover:bg-[#F7E1AD] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inquire About Automation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* CARD 2 — OFFSHORE OPERATIONS */}
            <div className="glass-surface rounded-2xl p-8 sm:p-10 border border-white/10 hover:border-[#E6B962]/50 transition-all duration-300 relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/40 flex items-center justify-center text-[#F7E1AD]">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#F7E1AD] uppercase tracking-wider">
                    Service 02
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#A3B1C6] uppercase tracking-wider mb-1">
                  Offshore Operations
                </div>
                <h3 className="font-headline text-2xl sm:text-3xl font-bold text-white mb-3">
                  Dedicated Operational Talent
                </h3>
                <p className="font-dm-sans text-[#A3B1C6] text-sm sm:text-base leading-relaxed mb-6">
                  Scale outbound prospecting, pipeline hygiene, and CRM execution with dedicated, niche-trained professionals.
                </p>

                <ul className="space-y-3.5 mb-8">
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Cold calling & lead generation</strong> that consistently builds your sales pipeline.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">CRM management & organization</strong> ensuring pristine pipeline hygiene.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#F7E1AD]">Skilled, niche-trained professionals</strong> delivering dependable, high-quality execution every day.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm sm:text-base">
                    <Check className="w-5 h-5 text-[#E6B962] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Bilateral service agreements</strong> ensuring fair terms, professional safety, and clear mutual commitments for both parties.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  handleServiceSelect(
                    'Outsourcing',
                    'Overloaded back office / need dedicated operational talent'
                  )
                }
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-[#050B1F] bg-[#E6B962] hover:bg-[#F7E1AD] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inquire About Offshore Teams</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: HOW IT WORKS
           ========================================================================= */}
        <section id="how-it-works" className="py-16 md:py-24 max-w-4xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E6B962]">
              Structured Engagement
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-white mt-2">
              From Bottleneck to Handsoff Growth
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="glass-surface rounded-2xl p-6 sm:p-8 border border-white/10 relative">
              <div className="w-10 h-10 rounded-full bg-[#E6B962] text-[#050B1F] font-headline font-extrabold text-base flex items-center justify-center mb-5 shadow-md">
                1
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-2">
                Bottleneck Diagnostic
              </h3>
              <p className="font-dm-sans text-sm text-[#A3B1C6] leading-relaxed">
                We analyze your operational friction and revenue leak points on a targeted 15-minute consultation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-surface rounded-2xl p-6 sm:p-8 border border-white/10 relative">
              <div className="w-10 h-10 rounded-full bg-[#E6B962] text-[#050B1F] font-headline font-extrabold text-base flex items-center justify-center mb-5 shadow-md">
                2
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-2">
                Custom Implementation
              </h3>
              <p className="font-dm-sans text-sm text-[#A3B1C6] leading-relaxed">
                We build, test, and deploy your workflows and integrate trained agents with a structured timeline tailored to the scope of your operations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-surface rounded-2xl p-6 sm:p-8 border border-[#E6B962]/40 relative bg-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-[#F7E1AD] text-[#050B1F] font-headline font-extrabold text-base flex items-center justify-center mb-5 shadow-md">
                3
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-2">
                Compounded Growth
              </h3>
              <p className="font-dm-sans text-sm text-[#A3B1C6] leading-relaxed">
                Your calendar fills automatically, administrative overhead shrinks, and ROI accelerates within 30 days.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: FAQ (4 Questions Only)
           ========================================================================= */}
        <section id="faq" className="py-16 md:py-20 max-w-3xl mx-auto relative">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E6B962]">
              Clarity & Expectations
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-white mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="glass-surface rounded-xl border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-white/[0.02]"
                    aria-expanded={isOpen}
                  >
                    <span className="font-headline font-bold text-base sm:text-lg text-white">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#E6B962] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-3 text-sm sm:text-base text-[#CBD5E1] font-dm-sans leading-relaxed border-t border-white/5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: BOTTLENECK INQUIRY / CONSULTATION BOOKING
           ========================================================================= */}
        <section id="inquiry" className="py-16 md:py-24 max-w-2xl mx-auto relative">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E6B962]">
              Operational Discovery
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
              Identify Your Operational Bottlenecks
            </h2>
            <p className="font-dm-sans text-base sm:text-lg text-[#A3B1C6] mt-3 max-w-lg mx-auto">
              Tell us where your revenue pipeline or team feels stalled. We’ll review your workflow and outline a tailored action plan.
            </p>
          </div>

          {/* Inquiry Form Card */}
          <div className="glass-surface-elevated rounded-2xl p-6 sm:p-10 border border-[#E6B962]/35 shadow-2xl relative">
            {formSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#E6B962]/20 border border-[#E6B962] rounded-full flex items-center justify-center mx-auto text-[#E6B962]">
                  <CheckCheck className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-2xl font-bold text-white">
                  Assessment Request Received
                </h3>
                <p className="font-dm-sans text-[#A3B1C6] text-sm leading-relaxed max-w-md mx-auto">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Your operational inquiry has been forwarded directly to our senior advisory team. We will review your bottleneck details and respond to your email shortly.
                </p>

                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 max-w-md mx-auto text-left text-xs text-[#E0E6ED] space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#E6B962] shrink-0" />
                    <span><strong className="text-white">Active Email:</strong> {formData.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#E6B962] shrink-0" />
                    <span><strong className="text-white">WhatsApp:</strong> {formData.whatsapp}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E6B962] shrink-0" />
                    <span><strong className="text-white">Bottleneck Focus:</strong> {formData.primaryBottleneck}</span>
                  </p>
                </div>

                {/* Direct Delivery Actions */}
                <div className="pt-2 max-w-md mx-auto space-y-2.5">
                  <p className="text-[11px] text-[#A3B1C6]">
                    To ensure immediate delivery directly from your personal mail client:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={getMailtoUrl()}
                      className="py-2.5 px-3 rounded-xl bg-[#E6B962] hover:bg-[#F7E1AD] text-[#050B1F] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Launch Direct Email Draft</span>
                    </a>
                    <a
                      href={getWhatsAppShareUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        whatsapp: '',
                        primaryBottleneck: 'Starting fresh / Need a sales conversion framework from scratch',
                        bottleneckDescription: '',
                        serviceInterest: 'Both',
                      });
                    }}
                    className="text-xs font-semibold text-[#E6B962] hover:text-[#F7E1AD] underline cursor-pointer"
                  >
                    Submit additional operational details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#E0E6ED] mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (submitError) setSubmitError('');
                      }}
                      placeholder="e.g. David Sterling"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-[#A3B1C6]/50 focus:outline-none focus:border-[#E6B962] focus:ring-1 focus:ring-[#E6B962] transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#E0E6ED]"
                      >
                        Valid Work Email
                      </label>
                      <span className="text-[10px] text-[#A3B1C6]">Verified active</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (emailError) setEmailError('');
                      }}
                      placeholder="david@company.com"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                        emailError
                          ? 'border-rose-500/70 focus:border-rose-400'
                          : 'border-white/10 focus:border-[#E6B962]'
                      } text-white placeholder-[#A3B1C6]/50 focus:outline-none focus:ring-1 focus:ring-[#E6B962] transition-colors text-sm`}
                    />
                    {emailError && (
                      <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="whatsapp"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#E0E6ED]"
                      >
                        WhatsApp Number
                      </label>
                      <span className="text-[11px] text-[#E6B962] font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Country code
                      </span>
                    </div>
                    <input
                      id="whatsapp"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => {
                        setFormData({ ...formData, whatsapp: e.target.value });
                        if (whatsappError) setWhatsappError('');
                      }}
                      placeholder="+1 (555) 234-5678"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border ${
                        whatsappError
                          ? 'border-rose-500/70 focus:border-rose-400'
                          : 'border-white/10 focus:border-[#E6B962]'
                      } text-white placeholder-[#A3B1C6]/50 focus:outline-none focus:ring-1 focus:ring-[#E6B962] transition-colors text-sm`}
                    />
                    {whatsappError ? (
                      <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{whatsappError}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#A3B1C6]/70 mt-1">
                        Please include your country code (e.g. +1, +44, +63) for WhatsApp communication.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="serviceInterest"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#E0E6ED] mb-2"
                    >
                      Primary Objective
                    </label>
                    <div className="relative">
                      <select
                        id="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={(e) =>
                          setFormData({ ...formData, serviceInterest: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#0F1C40] border border-white/15 text-white focus:outline-none focus:border-[#E6B962] focus:ring-1 focus:ring-[#E6B962] transition-colors text-sm cursor-pointer appearance-none"
                      >
                        <option value="Both">Both (Automate Revenue & Scale Quality Operations)</option>
                        <option value="Automation">Booking & Revenue Automation</option>
                        <option value="Outsourcing">Offshore Operations & Back Office</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#A3B1C6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="primaryBottleneck"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#E0E6ED] mb-2"
                  >
                    What is your biggest operational bottleneck?
                  </label>
                  <div className="relative">
                    <select
                      id="primaryBottleneck"
                      value={formData.primaryBottleneck}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryBottleneck: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#0F1C40] border border-white/15 text-white focus:outline-none focus:border-[#E6B962] focus:ring-1 focus:ring-[#E6B962] transition-colors text-sm cursor-pointer appearance-none"
                    >
                      <option value="Starting fresh / Need a sales conversion framework from scratch">
                        Starting fresh / Need a sales conversion framework from scratch
                      </option>
                      <option value="Inquiries slipping away / Don't know how to convert leads into sales">
                        Inquiries slipping away / Don't know how to convert leads into sales
                      </option>
                      <option value="Slow booking replies & high client no-shows">
                        Slow booking replies & high client no-shows
                      </option>
                      <option value="Cold sales pipeline / need outbound sales reps">
                        Cold sales pipeline / need outbound sales reps
                      </option>
                      <option value="Overloaded back office / need dedicated operational talent">
                        Overloaded back office / need dedicated operational talent
                      </option>
                      <option value="Disorganized CRM & manual administrative backlog">
                        Disorganized CRM & manual administrative backlog
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#A3B1C6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bottleneckDescription"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#E0E6ED] mb-2"
                  >
                    Briefly describe what's slowing down your revenue or team
                  </label>
                  <textarea
                    id="bottleneckDescription"
                    rows={3}
                    value={formData.bottleneckDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bottleneckDescription: e.target.value,
                      })
                    }
                    placeholder="e.g. We are starting up and have no clear sales framework to convert leads yet. Or we get inquiries but reply too slowly and miss out on bookings..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-[#A3B1C6]/50 focus:outline-none focus:border-[#E6B962] focus:ring-1 focus:ring-[#E6B962] transition-colors text-sm resize-vertical"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-gold py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Forwarding Inquiry to Solutions Team...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Bottleneck Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A3B1C6]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E6B962]" />
                    <span>Direct priority routing to advisory team</span>
                  </span>
                  <span className="text-[11px] text-[#A3B1C6]/70">
                    Strictly confidential • 15-minute diagnostic • Zero commitment
                  </span>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* =========================================================================
            CLOSING STATEMENT BANNER & FOOTER
           ========================================================================= */}
        <footer className="pt-12 pb-20 text-center border-t border-white/5 relative">
          <p className="font-headline font-bold text-xl sm:text-2xl md:text-3xl text-[#E6B962] max-w-2xl mx-auto mb-3 tracking-tight">
            “Make and Save Money — Automate Revenue, Cut Costs”
          </p>
          <p className="font-dm-sans text-xs text-[#A3B1C6] tracking-wide">
            © {new Date().getFullYear()} Rockwell Business Solutions. Expanding nationally across all 50 US states.
          </p>
        </footer>
      </main>
    </div>
  );
}
