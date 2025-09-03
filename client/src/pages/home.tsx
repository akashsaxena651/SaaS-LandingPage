import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Zap, Check, Clock, FileText, Smartphone, QrCode, Mail, ArrowRight, Flame, Twitter, Linkedin, Send, Star, Loader2 } from "lucide-react";
import { SiWhatsapp, SiGmail, SiUpwork } from "react-icons/si";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { toast } = useToast();

  // Check for payment status in URL on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const txnId = urlParams.get('txn');

    if (paymentStatus) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      switch (paymentStatus) {
        case 'success':
          toast({
            title: "Payment Successful!",
            description: `Your payment has been completed. Transaction ID: ${txnId}`,
          });
          break;
        case 'failed':
          toast({
            title: "Payment Failed",
            description: "Your payment could not be completed. Please try again.",
            variant: "destructive",
          });
          break;
        case 'error':
          toast({
            title: "Payment Error",
            description: "There was an error processing your payment. Please contact support.",
            variant: "destructive",
          });
          break;
      }
    }
  }, [toast]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Spot Reserved!",
      description: `Thank you! We've reserved your spot for ${email}. You'll be notified when InvoiceBolt launches.`,
    });
    
    setEmail("");
  };

  const handlePaymentClick = async () => {
    setIsPaymentLoading(true);
    
    try {
      // Create Razorpay order
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 999, // ₹999 in rupees
          description: "InvoiceBolt Lifetime Access",
          userId: null, // Can be set if user is logged in
        })
      });

      const result = await response.json();

      if (result.success && result.orderId) {
        // Open Razorpay checkout
        const options = {
          key: result.key,
          amount: result.amount,
          currency: result.currency,
          name: "InvoiceBolt",
          description: "Lifetime Access to InvoiceBolt",
          order_id: result.orderId,
          handler: async function (response: any) {
            // Payment successful, verify on server
            try {
              const verifyResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  merchantTransactionId: result.merchantTransactionId
                })
              });

              const verifyResult = await verifyResponse.json();

              if (verifyResult.success) {
                toast({
                  title: "Payment Successful!",
                  description: `Your payment has been completed. Transaction ID: ${response.razorpay_payment_id}`,
                });
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              toast({
                title: "Payment Error",
                description: "Payment verification failed. Please contact support.",
                variant: "destructive",
              });
            }
          },
          modal: {
            ondismiss: async function() {
              // Handle payment cancellation
              await fetch('/api/payment/failed', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  merchantTransactionId: result.merchantTransactionId,
                  error: "Payment cancelled by user"
                })
              });
              
              toast({
                title: "Payment Cancelled",
                description: "Payment was cancelled. You can try again anytime.",
              });
            }
          },
          prefill: {
            name: "Customer",
            email: email || "customer@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#6366f1"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', async function (response: any) {
          // Handle payment failure
          await fetch('/api/payment/failed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              merchantTransactionId: result.merchantTransactionId,
              error: response.error.description
            })
          });

          toast({
            title: "Payment Failed",
            description: response.error.description || "Payment failed. Please try again.",
            variant: "destructive",
          });
        });

        rzp.open();
      } else {
        throw new Error(result.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Could not start payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentLoading(false);
    }
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
      <section className="hero-gradient py-24 px-4 text-foreground relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Clean Hero Content */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight max-w-5xl mx-auto" data-testid="hero-headline">
              Turn Every Chat Into an 
              <span className="block text-primary mt-2">Invoice & Payment</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed" data-testid="hero-subtext">
              Auto-capture from WhatsApp, Gmail & Upwork. Generate GST invoices. Get paid instantly via UPI.
            </p>
          </div>

          {/* Elegant Demo Flow */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-2xl">
              
              {/* App Integration Bar */}
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="flex items-center bg-green-100 rounded-xl px-4 py-3 shadow-sm">
                  <SiWhatsapp className="w-6 h-6 text-green-600 mr-2" />
                  <span className="font-medium text-green-700">WhatsApp</span>
                </div>
                <div className="flex items-center bg-red-100 rounded-xl px-4 py-3 shadow-sm">
                  <SiGmail className="w-6 h-6 text-red-600 mr-2" />
                  <span className="font-medium text-red-700">Gmail</span>
                </div>
                <div className="flex items-center bg-green-100 rounded-xl px-4 py-3 shadow-sm">
                  <SiUpwork className="w-6 h-6 text-green-700 mr-2" />
                  <span className="font-medium text-green-800">Upwork</span>
                </div>
              </div>

              {/* Flow Demo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Chat → */}
                <div className="text-center">
                  <div className="bg-blue-50 rounded-2xl p-4 mb-3">
                    <div className="text-xs text-gray-600 mb-2">Client Message</div>
                    <div className="bg-white rounded-lg p-3 text-left text-xs shadow-sm">
                      <p className="font-medium">"Need invoice for ₹4,500"</p>
                      <p className="text-gray-500 mt-1">Web development work</p>
                    </div>
                    <div className="mt-3">
                      <div className="inline-flex items-center bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-captured
                      </div>
                    </div>
                  </div>
                </div>

                {/* → Invoice → */}
                <div className="text-center">
                  <div className="bg-purple-50 rounded-2xl p-4 mb-3">
                    <div className="text-xs text-gray-600 mb-2">GST Invoice</div>
                    <div className="bg-white rounded-lg p-3 text-xs shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-indigo-600">INVOICE</span>
                        <span className="text-gray-500">#INV-001</span>
                      </div>
                      <div className="text-left space-y-1">
                        <p><span className="text-gray-500">To:</span> Acme Corp</p>
                        <p><span className="text-gray-500">Amount:</span> <span className="font-bold">₹4,500</span></p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="inline-flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Generated
                      </div>
                    </div>
                  </div>
                </div>

                {/* → Payment */}
                <div className="text-center">
                  <div className="bg-green-50 rounded-2xl p-4 mb-3">
                    <div className="text-xs text-gray-600 mb-2">UPI Payment</div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-center mb-2">
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=upi://pay?pa=demo@upi&am=4500" 
                          alt="UPI QR" 
                          className="border border-gray-200 rounded"
                        />
                      </div>
                      <div className="text-xs font-bold text-green-600">₹4,500</div>
                    </div>
                    <div className="mt-3">
                      <div className="inline-flex items-center bg-green-600 text-white px-3 py-1 rounded-full text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Ready to pay
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Indicator */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Complete in 30 seconds</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="hero-subtext">
              Stop wasting hours on manual invoicing. Extract client details from any chat, 
              generate professional GST invoices, and get paid instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                onClick={handlePaymentClick}
                disabled={isPaymentLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-5 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl rounded-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                data-testid="button-reserve-spot"
              >
                {isPaymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "🚀 Get Lifetime Access — ₹999"
                )}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center" data-testid="text-guarantee">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">7-Day Guarantee</div>
                  <div className="text-xs">Full refund if not satisfied</div>
                </div>
              </div>
              
              <div className="flex items-center" data-testid="text-limited">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Limited Time</div>
                  <div className="text-xs">Only 100 lifetime spots</div>
                </div>
              </div>
              
              <div className="flex items-center" data-testid="text-no-fees">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">No Monthly Fees</div>
                  <div className="text-xs">Pay once, use forever</div>
                </div>
              </div>
            </div>
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
                <Button 
                  onClick={handlePaymentClick}
                  disabled={isPaymentLoading}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-70" 
                  data-testid="button-pay-now"
                >
                  {isPaymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
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
