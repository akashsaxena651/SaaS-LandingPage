import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Zap, Check, Clock, FileText, Smartphone, QrCode, Mail, ArrowRight, Flame, Twitter, Linkedin, Send, Star } from "lucide-react";
import { SiWhatsapp, SiGmail, SiUpwork } from "react-icons/si";

export default function Home() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Spot Reserved!",
      description: `Thank you! We've reserved your spot for ${email}. You'll be notified when InvoiceBolt launches.`,
    });
    
    setEmail("");
  };

  const handlePaymentClick = () => {
    window.open("https://rzp.io/l/your-checkout-link", "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="text-2xl text-primary" data-testid="logo-icon" />
            <span className="text-xl font-bold" data-testid="logo-text">InvoiceBolt</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-demo">Demo</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-pricing">Pricing</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient py-32 px-4 text-foreground relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" data-testid="hero-headline">
            One-Click Invoice from<br />
            <span className="text-primary">WhatsApp / Gmail / Upwork</span><br />
            → PDF + UPI Pay
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="hero-subtext">
            Stop wasting time. Auto-capture from chats, generate GST-ready invoices, 
            and get paid instantly via UPI link or QR.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button 
              onClick={handlePaymentClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
              data-testid="button-reserve-spot"
            >
              🚀 Reserve Your Spot — ₹999 Lifetime
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-guarantee">
            <Clock className="inline w-4 h-4 mr-2" />
            First 100 users only. 7-day money-back guarantee.
          </p>
          
          <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center" data-testid="feature-no-fees">
              <Check className="w-4 h-4 mr-2" />No monthly fees
            </span>
            <span className="flex items-center" data-testid="feature-gst">
              <Check className="w-4 h-4 mr-2" />GST compliant
            </span>
            <span className="flex items-center" data-testid="feature-setup">
              <Check className="w-4 h-4 mr-2" />Instant setup
            </span>
          </div>
        </div>
      </section>

      {/* App Logos Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-8">Seamlessly integrates with your favorite apps</p>
          <div className="flex justify-center items-center space-x-12">
            <div className="flex items-center space-x-2 text-muted-foreground" data-testid="logo-whatsapp">
              <SiWhatsapp className="w-8 h-8 text-green-500" />
              <span className="font-medium">WhatsApp</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground" data-testid="logo-gmail">
              <SiGmail className="w-8 h-8 text-red-500" />
              <span className="font-medium">Gmail</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground" data-testid="logo-upwork">
              <SiUpwork className="w-8 h-8 text-green-600" />
              <span className="font-medium">Upwork</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Steps Section */}
      <section id="demo" className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text" data-testid="heading-how-it-works">How It Works</h2>
            <p className="text-xl text-muted-foreground" data-testid="text-three-steps">Three simple steps to transform your invoicing</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Step 1 - WhatsApp Chat Demo */}
            <Card className="card-hover bg-card rounded-2xl p-6 shadow-lg border border-border" data-testid="card-step-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-2" data-testid="heading-capture-chat">Capture from Chat</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-capture-description">
                  One click to extract all invoice details
                </p>
              </div>
              
              {/* WhatsApp Chat Mock */}
              <div className="bg-gray-100 rounded-2xl p-4 mb-4 max-w-sm mx-auto">
                <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      AC
                    </div>
                    <span className="font-semibold text-sm">Acme Corp</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p>"Hi! Need invoice for the website work"</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2">
                      <div className="text-left">
                        <p>"Company: Acme Corp</p>
                        <p>Amount: ₹4,500</p>
                        <p>Service: Web Development</p>
                        <p>Due: Jan 30"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto-captured!
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Step 2 - Invoice Generation Demo */}
            <Card className="card-hover bg-card rounded-2xl p-6 shadow-lg border border-border" data-testid="card-step-2">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-2" data-testid="heading-generate-pdf">Generate GST Invoice</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-pdf-description">
                  Professional template, tax compliant
                </p>
              </div>
              
              {/* Mini Invoice Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mx-auto max-w-sm">
                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <div className="font-bold text-indigo-600">INVOICE</div>
                      <div className="text-gray-500">#INV-001</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-semibold">Your Business</div>
                      <div className="text-gray-500">GST: 22AAA...</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Bill To: Acme Corp</div>
                    <div className="text-gray-500">Web Development: ₹4,500</div>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="font-bold text-lg">₹4,500</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="inline-flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    GST Ready
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Step 3 - UPI Payment Demo */}
            <Card className="card-hover bg-card rounded-2xl p-6 shadow-lg border border-border" data-testid="card-step-3">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-2" data-testid="heading-get-paid">Get Paid Instantly</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-upi-description">
                  UPI link + QR for one-tap payments
                </p>
              </div>
              
              {/* UPI Payment Interface Mock */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mx-auto max-w-sm">
                <div className="text-center space-y-3">
                  <div className="text-sm font-semibold">Pay to Your Business</div>
                  <div className="text-2xl font-bold text-green-600">₹4,500</div>
                  
                  {/* Mini QR Code */}
                  <div className="flex justify-center">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=upi://pay?pa=demo@upi&am=4500" 
                      alt="UPI QR" 
                      className="border border-gray-200 rounded"
                    />
                  </div>
                  
                  <div className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                    Pay with UPI
                  </div>
                  
                  <div className="flex items-center justify-center text-xs text-gray-500 space-x-2">
                    <Smartphone className="w-3 h-3" />
                    <span>One-tap payment</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Invoice Preview Mock */}
      <section className="py-32 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" data-testid="heading-invoice-preview">Invoice Preview</h2>
            <p className="text-xl text-muted-foreground" data-testid="text-client-sees">This is what your client sees</p>
          </div>
          
          <Card className="bg-card rounded-2xl p-8 shadow-2xl invoice-shadow border border-border max-w-2xl mx-auto" data-testid="card-invoice-preview">
            {/* Invoice Header */}
            <div className="border-b border-border pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-primary" data-testid="text-invoice-title">INVOICE</h3>
                  <p className="text-muted-foreground" data-testid="text-invoice-number">#INV-001</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold" data-testid="text-business-name">Your Business Name</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-gst-number">GST: 22AAAAA0000A1Z5</p>
                </div>
              </div>
            </div>
            
            {/* Client Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Bill To:</h4>
                <p className="font-semibold" data-testid="text-client-name">Acme Co.</p>
                <p className="text-sm text-muted-foreground" data-testid="text-client-address">123 Business Street</p>
                <p className="text-sm text-muted-foreground" data-testid="text-client-city">Mumbai, MH 400001</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Invoice Date:</h4>
                <p data-testid="text-invoice-date">January 15, 2025</p>
                <h4 className="font-semibold mb-2 mt-4">Due Date:</h4>
                <p data-testid="text-due-date">January 30, 2025</p>
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="border border-border rounded-lg mb-6">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-semibold">Description</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-3" data-testid="text-service-description">Web Development Services</td>
                    <td className="p-3 text-right" data-testid="text-service-amount">₹4,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Total and QR */}
            <div className="flex justify-between items-center">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Pay via UPI</h4>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=demo@upi" 
                  alt="UPI Payment QR Code" 
                  className="mx-auto border border-border rounded-lg" 
                  data-testid="img-qr-code"
                />
                <p className="text-xs text-muted-foreground mt-2" data-testid="text-scan-to-pay">Scan to pay instantly</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary" data-testid="text-total-amount">₹4,500</div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="button-pay-now">
                  Pay Now
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text" data-testid="heading-lifetime-deal">Lifetime Deal — ₹999</h2>
          <p className="text-xl text-muted-foreground mb-12" data-testid="text-one-time-payment">One-time payment. No monthly fees.</p>
          
          <Card className="bg-card rounded-2xl p-8 shadow-xl border border-border max-w-md mx-auto" data-testid="card-pricing">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-4" data-testid="text-price">₹999</div>
              <p className="text-muted-foreground mb-6" data-testid="text-lifetime-access">Lifetime Access</p>
              
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center" data-testid="feature-integration">
                  <Check className="text-green-500 mr-3 w-5 h-5" />
                  <span>WhatsApp/Gmail/Upwork integration</span>
                </li>
                <li className="flex items-center" data-testid="feature-gst-compliant">
                  <Check className="text-green-500 mr-3 w-5 h-5" />
                  <span>GST-compliant invoices</span>
                </li>
                <li className="flex items-center" data-testid="feature-upi-payment">
                  <Check className="text-green-500 mr-3 w-5 h-5" />
                  <span>UPI payment links & QR</span>
                </li>
                <li className="flex items-center" data-testid="feature-unlimited">
                  <Check className="text-green-500 mr-3 w-5 h-5" />
                  <span>Unlimited invoices</span>
                </li>
                <li className="flex items-center" data-testid="feature-guarantee">
                  <Check className="text-green-500 mr-3 w-5 h-5" />
                  <span>7-day money-back guarantee</span>
                </li>
              </ul>
              
              <Button 
                onClick={handlePaymentClick}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 text-lg font-semibold transition-colors"
                data-testid="button-reserve-now"
              >
                Reserve Your Spot Now
              </Button>
              
              <p className="text-sm text-red-500 mt-4 font-semibold animate-bounce" data-testid="text-limited-spots">
                <Flame className="inline w-4 h-4 mr-2" />
                Only 100 spots available
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-card rounded-2xl p-8 shadow-lg border border-border max-w-2xl mx-auto" data-testid="card-testimonial">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <blockquote className="text-xl font-medium text-foreground mb-4" data-testid="text-testimonial-quote">
              "InvoiceBolt saved me 5 hours last week! Paid lifetime deal instantly worth it."
            </blockquote>
            <cite className="text-muted-foreground" data-testid="text-testimonial-author">
              — Rohit, Freelance Dev
            </cite>
          </Card>
        </div>
      </section>

      {/* Reserve Form */}
      <section className="py-32 px-4 bg-muted">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="heading-not-ready">Not ready to pay yet?</h2>
          <p className="text-muted-foreground mb-8" data-testid="text-reserve-spot">Reserve your spot and decide later</p>
          
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-email"
            />
            <Button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold transition-colors"
              data-testid="button-reserve"
            >
              Reserve My Spot
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-4" data-testid="text-no-spam">
            We'll notify you when InvoiceBolt is ready. No spam, promise.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-16 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="text-primary text-xl" />
              <span className="font-bold" data-testid="footer-logo">InvoiceBolt</span>
            </div>
            
            <div className="text-center md:text-right">
              <div className="mb-4">
                <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">Privacy Policy</a>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-refund">Refund Policy</a>
                  <a href="mailto:support@invoicebolt.com" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">Contact</a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2" data-testid="text-copyright">
                © 2025 InvoiceBolt · Not tax advice · Consult CA
              </p>
              <div className="flex space-x-4 justify-center md:justify-end">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-linkedin">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="mailto:support@invoicebolt.com" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-email">
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
