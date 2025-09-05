export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Contact</h1>
      <p className="text-muted-foreground mb-2">Questions, refunds, or tax invoices? Reach us at:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Email: <a className="text-primary" href="mailto:help.invoicebolt@gmail.com">help.invoicebolt@gmail.com</a></li>
        <li>WhatsApp: <a className="text-primary" href="https://wa.me/918830981744" target="_blank" rel="noreferrer">+91 88309 81744</a></li>
        <li>Calendly: <a className="text-primary" href="https://calendly.com/akashsaxena651/30min" target="_blank" rel="noreferrer">Book a 30‑min call</a></li>
      </ul>
    </div>
  );
}


