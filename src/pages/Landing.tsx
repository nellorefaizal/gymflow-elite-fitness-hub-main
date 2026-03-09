import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CreditCard, CalendarCheck, MessageSquare, Dumbbell, BarChart3, Check, Star, Menu, X, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const features = [
  { icon: Users, title: 'Member Management', desc: 'Track members, plans, and expiry dates effortlessly.' },
  { icon: CreditCard, title: 'Payment Tracking', desc: 'Record payments, generate invoices, and track revenue.' },
  { icon: CalendarCheck, title: 'Attendance & QR', desc: 'QR code check-in system with real-time tracking.' },
  { icon: MessageSquare, title: 'WhatsApp Automation', desc: 'Automated reminders for expiry, payments, and more.' },
  { icon: Dumbbell, title: 'Trainer & Workouts', desc: 'Assign trainers and custom workout plans to members.' },
  { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue, attendance, and member analytics at a glance.' },
];

const plans = [
  { name: 'Starter', price: '₹500', period: '/mo', features: ['Up to 50 members', 'Basic reports', 'Manual attendance', 'Email support'] },
  { name: 'Pro', price: '₹1,000', period: '/mo', popular: true, features: ['Up to 200 members', 'Advanced reports', 'QR attendance', 'WhatsApp automation', 'Workout plans', 'Priority support'] },
  { name: 'Enterprise', price: '₹2,000', period: '/mo', features: ['Unlimited members', 'Custom reports', 'Multi-branch', 'API access', 'Dedicated support', 'White label'] },
];

const testimonials = [
  { name: 'Rajesh K.', gym: 'Iron Paradise Gym', quote: 'GymFlow transformed how I manage my 200+ members. The WhatsApp automation alone saved me hours every week.' },
  { name: 'Priya M.', gym: 'FitZone Studio', quote: 'The QR attendance system is brilliant. Members love the instant check-in and I love the accurate reports.' },
  { name: 'Arjun S.', gym: 'PowerHouse Fitness', quote: 'Best investment for my gym. Clean interface, powerful features, and the support team is incredibly responsive.' },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <nav className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Dumbbell className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors" />
            </div>
            <span className="font-heading text-2xl gold-text">GymFlow</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
            <Link to="/login" className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors">Login</Link>
            <Button asChild className="gold-gradient text-primary-foreground rounded-full px-6 font-accent tracking-wider hover:opacity-90">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-muted-foreground">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <div className="container max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors py-2">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors py-2">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors py-2">Testimonials</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-accent text-muted-foreground hover:text-primary transition-colors py-2">Login</Link>
              <Button asChild className="gold-gradient text-primary-foreground rounded-full font-accent tracking-wider hover:opacity-90">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center pt-20">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        {/* Gym Equipment Icons Floating */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 md:top-32 left-4 md:left-10 opacity-10 z-10"
        >
          <Dumbbell className="h-16 md:h-24 w-16 md:w-24 text-primary rotate-45" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-24 md:bottom-32 right-4 md:right-10 opacity-10 z-10"
        >
          <Dumbbell className="h-20 md:h-32 w-20 md:w-32 text-primary -rotate-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl px-4"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-primary/30 bg-primary/5 mb-6 md:mb-8"
          >
            <Zap className="h-3 md:h-4 w-3 md:w-4 text-primary" />
            <span className="text-xs md:text-sm font-accent text-primary">Transform Your Gym Management</span>
          </motion.div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-wider gold-text mb-4 md:mb-6 leading-tight">
            GymFlow
          </h1>
          <p className="text-lg sm:text-xl md:text-3xl text-foreground max-w-3xl mx-auto font-body mb-3 md:mb-4 leading-relaxed px-2">
            The Ultimate Gym Management Platform
          </p>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-body mb-8 md:mb-10 px-4">
            Streamline operations, boost revenue, and deliver exceptional member experiences—all from one powerful dashboard
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-12 px-4">
            <Button asChild className="gold-gradient text-primary-foreground rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-accent tracking-wider hover:opacity-90 transition-opacity group w-full sm:w-auto">
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-accent tracking-wider border-primary/30 hover:border-primary hover:bg-primary/5 w-full sm:w-auto">
              <Link to="/login">Login</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground px-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 md:h-5 w-4 md:w-5 text-primary" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-primary" />
              <span>Boost Revenue 40%</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 md:h-5 w-4 md:w-5 text-primary" />
              <span>500+ Gyms Trust Us</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 md:w-6 h-8 md:h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5 md:p-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 px-4 scroll-mt-20">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-heading gold-text mb-10 md:mb-16 px-4">Everything You Need</h2>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 md:p-8 card-glow group hover:border-primary/30 transition-colors"
              >
                <f.icon className="h-8 md:h-10 w-8 md:w-10 text-primary mb-3 md:mb-4" />
                <h3 className="text-xl md:text-2xl font-heading mb-2">{f.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24 px-4 bg-secondary/30 scroll-mt-20">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-heading gold-text mb-10 md:mb-16 px-4">Simple Pricing</h2>
          <div className="grid gap-6 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-xl border p-6 md:p-8 flex flex-col ${plan.popular ? 'border-primary bg-card card-glow scale-105 md:scale-110' : 'border-border bg-card'}`}
              >
                {plan.popular && (
                  <span className="font-accent text-xs text-primary mb-2 uppercase tracking-wider">Most Popular</span>
                )}
                <h3 className="text-2xl md:text-3xl font-heading">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl md:text-4xl font-heading gold-text">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs md:text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 gold-gradient text-primary-foreground rounded-full font-accent tracking-wider hover:opacity-90 w-full">
                  <Link to="/register">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 px-4 scroll-mt-20">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-heading gold-text mb-10 md:mb-16 px-4">Trusted By Gym Owners</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 md:p-8"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3 md:h-4 w-3 md:w-4 fill-primary text-primary" />)}
                </div>
                <p className="text-sm md:text-base text-muted-foreground italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center font-heading text-primary-foreground">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.gym}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12 px-4">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 md:h-6 w-5 md:w-6 text-primary" />
            <span className="font-heading text-xl md:text-2xl gold-text">GymFlow</span>
          </div>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
          </div>
          <p className="text-xs text-muted-foreground">Powered by GymFlow © 2026</p>
        </div>
      </footer>
    </div>
  );
}
