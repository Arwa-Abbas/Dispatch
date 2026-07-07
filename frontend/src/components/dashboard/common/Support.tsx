import React, { useState } from 'react';
import { QuestionMarkCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const Support: React.FC = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'General',
      question: 'How do I create a shipment?',
      answer: 'Go to your dashboard and click on "Create Shipment". Fill in the sender and receiver details, package information, and submit the form. You\'ll receive a tracking number once the shipment is created.',
    },
    {
      id: 2,
      category: 'Tracking',
      question: 'How do I track my shipment?',
      answer: 'You can track your shipment by going to "My Shipments" in your dashboard. Click on any shipment to see its current status and tracking history.',
    },
    {
      id: 3,
      category: 'Delivery',
      question: 'How long does delivery take?',
      answer: 'Delivery times vary depending on the distance and service type. Standard delivery usually takes 2-3 business days, while express delivery takes 1-2 business days.',
    },
    {
      id: 4,
      category: 'Payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, and cash on delivery. All payments are processed securely through our payment partners.',
    },
    {
      id: 5,
      category: 'Account',
      question: 'How do I update my profile information?',
      answer: 'Go to "Profile" in your dashboard. You can update your name, phone number, address, and other personal information. Click "Save Changes" after making updates.',
    },
    {
      id: 6,
      category: 'Support',
      question: 'How do I contact customer support?',
      answer: 'You can reach us through our 24/7 live chat, email at support@dispatch.com, or call us at +92 300 1234567. We\'re here to help!',
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600">How can we help you today?</p>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredFAQs.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <QuestionMarkCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No FAQs found matching your search</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="px-6">
                <button
                  onClick={() => setActiveFAQ(activeFAQ === faq.id ? null : faq.id)}
                  className="w-full py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {faq.category}
                    </span>
                    <h3 className="mt-1 font-medium text-gray-900">{faq.question}</h3>
                  </div>
                  <ArrowRightIcon
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                      activeFAQ === faq.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFAQ === faq.id && (
                  <div className="pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Support;