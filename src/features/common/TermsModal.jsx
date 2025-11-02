import React from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { ShieldCheck } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service" size="3xl">
            <div className="prose prose-sm max-w-none max-h-[70vh] overflow-y-auto pr-2">
                <p><strong>Last Updated: October 31, 2025</strong></p>
                <p>
                    Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the
                    AGWA Water Services, Inc. ("AGWA", "us", "we", or "our") customer portal (the "Service").
                </p>
                <p>
                    Your access to and use of the Service is conditioned on your acceptance of and compliance with
                    these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>

                <h4>1. Account Registration and Security</h4>
                <ul>
                    <li>
                        To use this Service, you must be a registered customer of AGWA Water Services, Inc.
                        You agree to provide information that is accurate, complete, and current at all times.
                        Failure to do so constitutes a breach of the Terms, which may result in immediate
                        termination of your account on our Service.
                    </li>
                    <li>
                        You are responsible for safeguarding the password that you use to access the Service
                        and for any activities or actions under your password.
                    </li>
                    <li>
                        You agree not to disclose your password to any third party. You must notify us
                        immediately upon becoming aware of any breach of security or unauthorized use of
                        your account.
                    </li>
                </ul>

                <h4>2. Use of the Service</h4>
                <p>
                    You agree to use the Service only for lawful purposes. You are responsible for all
                    of your activity in connection with the Service. You shall not (and shall not permit
                    any third party to):
                </p>
                <ul>
                    <li>
                        Take any action that imposes or may impose (as determined by us in our sole
                        discretion) an unreasonable or disproportionately large load on our
                        infrastructure.
                    </li>
                    <li>
                        Interfere or attempt to interfere with the proper working of the Service or
                        any activities conducted on the Service.
                    </li>
                    <li>
                        Bypass any measures we may use to prevent or restrict access to the Service.
                    </li>
                </ul>

                <h4>3. Online Payments</h4>
                <ul>
                    <li>
                        The Service provides a platform to facilitate payments for your water bills using
                        third-party payment gateways (e.g., Stripe).
                    </li>
                    <li>
                        AGWA is not a bank or financial institution. All payment transactions are
                        processed by our third-party payment partners. You agree to abide by the terms
                        and conditions of these partners.
                    </li>
                    <li>
                        You are responsible for ensuring that your payment information is correct and
                        that you have sufficient funds to cover your payment.
                    </li>
                </ul>

                <h4>4. Disclaimers</h4>
                <p>
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Service
                    is at your sole risk.
                </p>
                <p>
                    AGWA does not warrant that (a) the Service will function uninterrupted, secure, or
                    available at any particular time or location; (b) any errors or defects will be
                    corrected; (c) the Service is free of viruses or other harmful components.
                </p>
                <p>
                    All data presented in the Portal (including consumption, billing amounts, and
                    payment status) is provided for convenience. In the event of any discrepancy,
                    the official records held by AGWA Water Services, Inc. shall be deemed correct.
                </p>

                <h4>5. Limitation of Liability</h4>
                <p>
                    In no event shall AGWA, nor its directors, employees, partners, or agents,
                    be liable for any indirect, incidental, special, consequential, or punitive damages,
                    including without limitation, loss of profits, data, use, goodwill, or other
                    intangible losses, resulting from your access to or use of or inability to access
                    or use the Service.
                </p>

                <h4>6. Governing Law</h4>
                <p>
                    These Terms shall be governed and construed in accordance with the laws of the
                    Republic of the Philippines, without regard to its conflict of law provisions.
                </p>

                <h4>7. Changes to Terms</h4>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms
                    at any time. We will provide notice of any changes by posting the new Terms on this page.
                    Your continued use of the Service after any such changes constitutes your acceptance
                    of the new Terms.
                </p>

                <h4>8. Contact Us</h4>
                <p>
                    If you have any questions about these Terms, please contact us through the
                    "Contact Us" page available after logging in.
                </p>
            </div>
        </Modal>
    );
};

export default TermsModal;