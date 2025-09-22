import ContactForm from '@/components/ContactForm'; // Import the existing component
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12"> {/* Added padding and background */}
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
          Contact Us
        </h1>
        {/* Render the existing ContactForm component */}
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
} 