import React from 'react';
import { Eye, Shield, Database } from 'lucide-react';

const DataPrivacySection = () => {
    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn leading-relaxed text-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <Eye size={30} className="mr-3 text-blue-600" />
                    Data Privacy Notice
                </h2>
            </div>
            
            <p className="mb-4 text-sm text-gray-500">Last Updated: October 31, 2025</p>

            <div className="prose prose-sm max-w-none">
                <p>AGWA Water Services, Inc. ("AGWA") is committed to protecting your privacy in compliance with the Republic Act No. 10173, or the Data Privacy Act of 2012 (DPA), its Implementing Rules and Regulations (IRR), and other relevant data privacy laws.</p>

                <h4>1. What We Collect</h4>
                <p>We collect and process your personal information when you register for an account, pay your bills, or report an issue. This information may include:</p>
                <ul>
                    <li><strong>Personal Identification Data:</strong> Full name, email address, phone number.</li>
                    <li><strong>Account Data:</strong> AGWA Account Number, service address, meter serial number, service type.</li>
                    <li><strong>Billing and Payment Data:</strong> Billing history, payment history, consumption data, payment method details (which are processed by our payment partners).</li>
                    <li><strong>Usage Data:</strong> How you interact with the Portal, IP address, device type, and browser.</li>
                </ul>

                <h4>2. How We Use Your Information</h4>
                <p>Your personal data is used for the following purposes:</p>
                <ul>
                    <li>To create, maintain, and secure your Portal account.</li>
                    <li>To process your water bill payments and manage your account.</li>
                    <li>To provide and manage your water services, including meter reading and maintenance.</li>
                    <li>To respond to your inquiries, concerns, and support tickets.</li>
                    <li>To send you service advisories, billing reminders, and other essential communications.</li>
                    <li>To analyze portal usage to improve our services and user experience.</li>
                    <li>To comply with legal and regulatory obligations.</li>
                </ul>

                <h4>3. Data Sharing and Disclosure</h4>
                <p>We do not sell your personal information. We may share your data with:</p>
                <ul>
                    <li><strong>Third-Party Service Providers:</strong> Such as payment gateways and technology partners who help us operate the Portal, under strict confidentiality agreements.</li>
                    <li><strong>Government and Regulatory Bodies:</strong> When required by law, such as in response to a court order or legal process.</li>
                </ul>
                <p>This project is a simulation, and your data is stored in a Firebase project. In a real-world scenario, all data would be governed by stringent security and access controls.</p>

                <h4>4. Data Security</h4>
                <p>We implement robust technical, physical, and organizational security measures to protect your personal information from unauthorized access, use, alteration, or disclosure. This includes data encryption, access controls, and secure data storage practices.</p>

                <h4>5. Your Rights as a Data Subject</h4>
                <p>Under the DPA, you have the right to:</p>
                <ul>
                    <li><strong>Be Informed:</strong> The right to know how your data is being processed.</li>
                    <li><strong>Access:</strong> The right to request access to your personal information.</li>
                    <li><strong>Rectify:</strong> The right to correct any inaccuracies in your data.</li>
                    <li><strong>Erase/Block:</strong> The right to suspend, withdraw, or request the deletion of your data.</li>
                    <li><strong>Object:</strong> The right to object to the processing of your personal data.</li>
                    <li><strong>Data Portability:</strong> The right to obtain a copy of your data in a machine-readable format.</li>
                    <li><strong>Lodge a Complaint:</strong> The right to file a complaint with the National Privacy Commission (NPC).</li>
                </ul>
                <p>To exercise these rights, please contact our Data Privacy Officer through the details in the "Contact Us" section.</p>

                <h4>6. Data Retention</h4>
                <p>We will retain your personal data only for as long as necessary for the purposes set out in this notice, for our legal and regulatory obligations, or until you request its deletion.</p>

                <h4>7. Changes to This Notice</h4>
                <p>We may update this Data Privacy Notice from time to time. We will notify you of any significant changes by posting the new notice on this page and updating the "Last Updated" date.</p>
            </div>
        </div>
    );
};

export default DataPrivacySection;