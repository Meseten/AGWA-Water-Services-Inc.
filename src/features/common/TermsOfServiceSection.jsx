import React from 'react';
import { ShieldCheck, User, XCircle, FileText } from 'lucide-react';

const TermsOfServiceSection = () => {
    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn leading-relaxed text-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <ShieldCheck size={30} className="mr-3 text-green-600" />
                    Terms of Service
                </h2>
            </div>
            
            <p className="mb-4 text-sm text-gray-500">Last Updated: October 31, 2025</p>

            <div className="prose prose-sm max-w-none">
                <p>Welcome to the AGWA Water Services, Inc. ("AGWA", "we", "us", "our") Customer Portal ("Portal"). By accessing or using this Portal, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use this Portal.</p>

                <h4>1. Account Registration and Security</h4>
                <ul>
                    <li>You must be an active customer of AGWA to create an account.</li>
                    <li>You agree to provide accurate, current, and complete information during the registration process.</li>
                    <li>You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</li>
                </ul>

                <h4>2. Use of the Portal</h4>
                <p>AGWA grants you a limited, non-exclusive, non-transferable, and revocable license to use the Portal for your personal, non-commercial purposes, subject to these Terms. You agree not to:</p>
                <ul>
                    <li>Use the Portal for any illegal or unauthorized purpose.</li>
                    <li>Attempt to gain unauthorized access to our computer systems or networks.</li>
                    <li>Introduce any viruses, Trojan horses, worms, or other malicious software.</li>
                    <li>Use the Portal in any manner that could damage, disable, overburden, or impair the service.</li>
                </ul>

                <h4>3. Online Payments</h4>
                <ul>
                    <li>The Portal facilitates (simulated) online payments for your water bills.</li>
                    <li>You are responsible for ensuring that your payment information is correct and that you have sufficient funds.</li>
                    <li>All payments are processed through third-party payment gateways. AGWA is not responsible for any errors, fees, or data breaches caused by these third-party services.</li>
                    <li>In a real-world application, all payments would be final and non-refundable, except as required by law or our billing policies.</li>
                </ul>

                <h4>4. Disclaimers</h4>
                <ul>
                    <li>The Portal is provided "as is" and "as available" without any warranties of any kind, express or implied.</li>
                    <li>We do not warrant that the Portal will be uninterrupted, error-free, or secure.</li>
                    <li>Data presented in the Portal (e.g., consumption, bill amounts) is for convenience. In case of any discrepancy, the official records held by AGWA shall prevail.</li>
                </ul>

                <h4>5. Limitation of Liability</h4>
                <p>To the fullest extent permitted by law, AGWA Water Services, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Portal; (b) any conduct or content of any third party on the Portal; or (c) unauthorized access, use, or alteration of your transmissions or content.</p>

                <h4>6. Termination</h4>
                <p>We reserve the right to suspend or terminate your access to the Portal at any time, with or without notice, for any reason, including for violation of these Terms.</p>

                <h4>7. Changes to Terms</h4>
                <p>We may modify these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Your continued use of the Portal after such changes constitutes your acceptance of the new Terms.</p>
                
                <h4>8. Governing Law</h4>
                <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law principles.</p>
            </div>
        </div>
    );
};

export default TermsOfServiceSection;