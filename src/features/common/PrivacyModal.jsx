import React from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { Eye } from 'lucide-react';

const PrivacyModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Data Privacy Notice" size="3xl">
            <div className="prose prose-sm max-w-none max-h-[70vh] overflow-y-auto pr-2">
                <p><strong>Last Updated: October 31, 2025</strong></p>
                
                <h4>Our Commitment to Privacy</h4>
                <p>
                    AGWA Water Services, Inc. ("AGWA") is committed to protecting your privacy in accordance with
                    Republic Act No. 10173, also known as the Data Privacy Act of 2012 (DPA), its Implementing Rules
                    and Regulations (IRR), and other relevant data privacy laws.
                </p>

                <h4>1. What Personal Information We Collect</h4>
                <p>
                    We collect, store, and process your personal information when you register for an account,
                    use our services, pay your bills, or interact with our customer support. This information may include:
                </p>
                <ul>
                    <li>
                        <strong>Personal Identification Data:</strong> Full name, email address, phone number, and service address.
                    </li>
                    <li>
                        <strong>Account and Service Data:</strong> AGWA Account Number, meter serial number, service type,
                        account status, and account creation date.
                    </li>
                    <li>
                        <strong>Financial and Transaction Data:</strong> Billing history, payment history, consumption data,
                        payment method details (which are securely processed by our third-party payment partners),
                        and rebate point information.
                    </li>
                    <li>
                        <strong>Communication Data:</strong> Records of your correspondence with us, such as support tickets,
                        chat logs, and issue reports.
                    </li>
                </ul>

                <h4>2. How We Use Your Information</h4>
                <p>Your personal data is used for the following legitimate business purposes:</p>
                <ul>
                    <li>To create, maintain, and secure your AGWA Portal account.</li>
                    <li>To provide and manage your water services, including meter reading, billing, and maintenance.</li>
                    <li>To process your bill payments and manage your account transactions.</li>
                    <li>To respond to your inquiries, concerns, and support tickets, and to provide customer support.</li>
                    <li>To send you essential service advisories, billing reminders, and other system notifications.</li>
                    <li>To manage your participation in programs such as the AGWA Rewards Program.</li>
                    <li>To analyze portal and service usage to improve our operations, services, and user experience.</li>
                    <li>To comply with our legal and regulatory obligations as a public utility.</li>
                </ul>

                <h4>3. Data Sharing and Disclosure</h4>
                <p>
                    We do not sell or rent your personal information. We may share your data in the following
                    limited circumstances:
                </p>
                <ul>
                    <li>
                        <strong>Third-Party Service Providers:</strong> With trusted partners who perform services on our behalf,
                        such as payment gateways (e.g., Stripe) and data hosting (e.g., Firebase). These partners
                        are contractually bound to protect your data and use it only for the purposes we specify.
                    </li>
                    <li>
                        <strong>Legal and Regulatory Requirements:</strong> When required by law, such as in response to a
                        subpoena, court order, or formal request from government authorities.
                    </li>
                    <li>
                        <strong>Emergency:</strong> To protect the vital interests of any individual, such as during
                        emergencies or service-related safety incidents.
                    </li>
                </ul>

                <h4>4. Data Security and Retention</h4>
                <p>
                    We implement robust technical, physical, and organizational security measures to protect your
                    personal information from unauthorized access, use, alteration, or disclosure. This includes
                    data encryption, access controls, and secure server environments.
                </p>
                <p>
                    We retain your personal data only for as long as your account is active or as necessary to
                    fulfill the purposes outlined in this notice, and as required by law for auditing and
                    regulatory record-keeping.
                </p>

                <h4>5. Your Rights as a Data Subject</h4>
                <p>In accordance with the Data Privacy Act, you have the right to:</p>
                <ul>
                    <li><strong>Be Informed</strong> that your personal data will be, are being, or were processed.</li>
                    <li><strong>Access</strong> your personal information we hold.</li>
                    <li><strong>Rectify</strong> any inaccuracies or errors in your data.</li>
                    <li><strong>Erase or Block</strong> your data from our systems, subject to legal and contractual limitations.</li>
                    <li><strong>Object</strong> to the processing of your personal data.</li>
                    <li><strong>Data Portability</strong> to obtain a copy of your data in a machine-readable format.</li>
                    <li><strong>Lodge a Complaint</strong> with the National Privacy Commission (NPC) if you feel
                        your data privacy rights have been violated.
                    </li>
                </ul>

                <h4>6. Contacting Us</h4>
                <p>
                    To exercise any of these rights or if you have any questions about this privacy notice,
                    please contact our Data Privacy Officer at:
                </p>
                <p>
                    <strong>Email:</strong> <a href="mailto:dpo@agwa-waterservices.com.ph">dpo@agwa-waterservices.com.ph</a><br/>
                    <strong>Hotline:</strong> 1627-AGWA (Attn: Data Privacy Officer)
                </p>

                <h4>7. Changes to This Notice</h4>
                <p>
                    We may update this Data Privacy Notice from time to time. We will notify you of any
                    significant changes by posting the new notice on this page and updating the "Last Updated" date.
                </p>
            </div>
        </Modal>
    );
};

export default PrivacyModal;