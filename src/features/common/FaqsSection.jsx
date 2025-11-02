import React from 'react';
import { HelpCircle, ChevronDown, ShieldQuestion } from 'lucide-react';

const faqsData = [
    { q: "How do I register for an online account?", a: "Click 'Sign Up' on the login page. Provide your full name, AGWA account number (e.g., RES-12345), a valid email address, and create a password of at least 6 characters." },
    { q: "I forgot my password. How can I reset it?", a: "On the login page, click the 'Forgot Password?' link. Enter the email address associated with your AGWA account, and we'll send you a link to reset your password." },
    { q: "How can I pay my water bill through this portal?", a: "Once logged in, navigate to 'My Bills'. Select an unpaid bill, click 'Pay Now', and choose a simulated payment option (e.g., GCash, Maya, Bank Transfer, Credit Card). Please note that payments in this portal are for demonstration purposes only. For actual payments, please use AGWA's officially accredited payment channels." },
    { q: "How is my water consumption calculated?", a: "Your consumption is the difference between your current meter reading and your previous meter reading, measured in cubic meters (m³). This consumption is then used with the tariff rates applicable to your service type to calculate your water bill charges." },
    { q: "What are the different charges on my bill?", a: "Your bill typically includes a Basic Charge (based on consumption and service type), Foreign Currency Differential Adjustment (FCDA), Environmental Charge (EC), Sewerage Charge (SC, if applicable), Maintenance Service Charge (based on your meter size), Government Taxes, and Value Added Tax (VAT). You can use the '✨ Explain Bill' feature in the 'My Bills' section for a personalized breakdown of a specific bill." },
    { q: "How can I view my past bills and payment history?", a: "Navigate to the 'My Bills' section after logging in. You'll find a history of your past bills, their status (Paid/Unpaid), and payment details if paid via the portal (simulated). You can also view a detailed invoice for each bill." },
    { q: "What should I do if I suspect a water leak at my premises?", a: "If it's safe to do so, try to identify the source of the leak and turn off your main water shut-off valve (usually located near your meter). Immediately report the suspected leak to AGWA via the 'Report Issue' section in the portal or by calling our 24/7 emergency hotline: 1627-AGWA (1627-2492)." },
    { q: "My water supply is interrupted. What should I do?", a: "First, check for any service advisories on our official AGWA website or social media channels. If there are no posted advisories for your area, please report the interruption via the 'Report Issue' section in the portal or call our customer service hotline with your account details." },
    { q: "Can I change my registered email address or other profile details?", a: "You can update your Display Name, Photo URL, Service Address, and Meter Size in the 'My Profile' section. For changes to critical information like your registered email address (if it's your primary login ID), account number, or assigned role, please contact AGWA customer support for assistance and verification." },
    { q: "What is FCDA (Foreign Currency Differential Adjustment)?", a: "FCDA is a tariff mechanism approved by regulatory bodies that allows water utilities like AGWA to recover or pass on to customers the gains or losses arising from fluctuations in foreign exchange rates. These fluctuations affect the cost of foreign currency-denominated loans and expenses used for service improvements and operational needs." },
    { q: "Why is there an Environmental Charge (EC) on my bill?", a: "The Environmental Charge (EC) is a fee collected to fund projects and initiatives related to wastewater treatment, septage management, and other environmental protection programs. This helps ensure that water resources are used sustainably and that wastewater is treated properly before being discharged back into the environment." },
    { q: "What if I think my water meter is malfunctioning or inaccurate?", a: "If you suspect your water meter is not recording your consumption accurately, please report it immediately. You can do this through the 'Report Issue' section of the portal (select 'Meter Problem') or by contacting AGWA customer service. We will arrange for an inspection and testing of your meter." },
    { q: "How often are water meters read?", a: "Water meters are typically read on a monthly cycle. The specific reading schedule can vary by area. Your billing statement will indicate the period covered by the meter reading (e.g., 'Billing Period: 01 Jan 2025 to 31 Jan 2025')." },
    { q: "Are there discounts for senior citizens or Persons with Disabilities (PWDs)?", a: "Yes, AGWA Water Services adheres to Republic Act No. 9994 (Expanded Senior Citizens Act) and Republic Act No. 10754 (Act Expanding the Benefits and Privileges of Persons with Disability). Qualified senior citizens and PWDs are entitled to a discount on their water consumption, subject to certain conditions (e.g., the account must be registered in their name, consumption limits). Please update your details in 'My Profile' or contact customer service with the necessary identification to apply for these discounts." },
    { q: "How do I update my contact number or service address on file with AGWA?", a: "You can update your Service Address directly in the 'My Profile' section of this portal. For changes to your primary contact number, especially if it's used for OTPs or critical alerts, it's best to contact AGWA customer service or visit one of our business offices to ensure your records are accurately updated and verified." },
    { q: "What are the accepted payment methods for my water bill?", a: "This portal simulates payments via various methods for demonstration. For actual payments, AGWA accepts payments through a wide range of accredited channels, including: AGWA Business Offices, Bayad Centers, 7-Eleven, SM Bills Payment, selected banks (over-the-counter and online banking), and mobile wallets like GCash and Maya. Please refer to the official AGWA website or your bill statement for a complete list of authorized payment partners." },
    { q: "How can I get an official receipt (OR) after making a payment?", a: "For payments made through this portal (which are simulated), a transaction reference is provided. For actual payments made via AGWA's accredited channels, an official receipt or proof of payment will be issued by that specific channel (e.g., a bank validation slip, a payment center receipt, a digital receipt from an e-wallet). AGWA is continuously working on enhancing digital services, including the future provision of consolidated digital ORs through the portal." },
    { q: "What is a 'meter deposit' for new service connections?", a: "A meter deposit is a one-time charge collected from customers upon application for a new water service connection. This deposit serves as a security against potential unpaid bills or damages to the water meter. It is refundable, with interest (if applicable by law), upon termination of the service contract, provided all outstanding obligations to AGWA have been settled." },
    { q: "How do I report a damaged, leaking, or stolen water meter?", a: "Report any instance of a damaged, leaking, or stolen water meter to AGWA immediately. You can use the 'Report Issue' section in this portal (select 'Meter Problem') or call our emergency hotline. Tampering with or unauthorized removal of water meters is illegal and may result in penalties." },
    { q: "Can I request for a temporary disconnection of my water service if I'll be away for an extended period?", a: "Yes, you can request a temporary or voluntary disconnection of your water service. To do this, please visit any AGWA business office to file your formal request. There might be applicable fees for the disconnection and subsequent reconnection process. Please inquire about the specific requirements and charges." }
];


const FaqsSection = () => {
    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <ShieldQuestion size={30} className="mr-3 text-blue-600" />
                    Frequently Asked Questions
                </h2>
            </div>

            <div className="space-y-4">
                {faqsData.map((faq, index) => (
                    <details
                        key={index}
                        className="group bg-gray-50 hover:bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
                    >
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-900 text-sm sm:text-base">
                            <span className="group-open:text-blue-700 group-open:font-semibold">
                                {faq.q}
                            </span>
                            <span className="transition-transform duration-300 transform group-open:rotate-180 text-blue-600 group-open:text-blue-700">
                                <ChevronDown size={24} />
                            </span>
                        </summary>
                        <div className="text-gray-600 mt-3 prose prose-sm max-w-none grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                            <div className="overflow-hidden">
                                <p className="pb-2">{faq.a}</p>
                            </div>
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default FaqsSection;