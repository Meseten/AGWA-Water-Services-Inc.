import React, { useState, useEffect } from 'react';
import { AlertTriangle, MessageCircle, MapPin, Sparkles, Send, Loader2, ListChecks } from 'lucide-react';
import { callDeepseekAPI } from '../../services/deepseekService.js';
import * as DataService from '../../services/dataService.js';
import useForm from '../../hooks/useForm.js';
import Tooltip from '../../components/ui/Tooltip.jsx';

const commonInputClass = "w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition duration-150 text-sm placeholder-gray-400";
const commonButtonClass = "flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95 text-sm";

const formatAddressToString = (addressObj) => {
    if (!addressObj || typeof addressObj !== 'object') return '';
    const parts = [addressObj.street, addressObj.barangay, addressObj.district];
    return parts.filter(p => p && p.trim()).join(', ');
};

const ReportIssueSection = ({ user, userData, db, auth, showNotification }) => {
    
    const getInitialAddress = () => {
        if (userData?.serviceAddress && typeof userData.serviceAddress === 'object') {
            return formatAddressToString(userData.serviceAddress);
        }
        return userData?.accountNumber || '';
    };

    const initialFormValues = {
        issueType: '',
        description: '',
        issueAddress: getInitialAddress(),
    };
    
    const [isAiCategorizing, setIsAiCategorizing] = useState(false);
    const [isAiAssisting, setIsAiAssisting] = useState(false);
    
    const validateForm = (currentValues) => {
        const errors = {};
        if (!currentValues.issueType) errors.issueType = "Please select an issue type.";
        if (!currentValues.description.trim()) errors.description = "Description cannot be empty.";
        if (!currentValues.issueAddress.trim()) errors.issueAddress = "Please specify the location of the issue.";
        return errors;
    };

    const submitIssueReport = async (formValues, resetFormCallback) => {
        const ticketData = {
            ...formValues,
            userId: user.uid,
            userName: userData.displayName,
            userEmail: userData.email,
            accountNumber: userData.accountNumber || "N/A",
        };
        const result = await DataService.createSupportTicket(db, ticketData);
        if (result.success) {
            showNotification("Support ticket submitted successfully!", "success");
            resetFormCallback();
        } else {
            showNotification(result.error || "Failed to submit ticket.", "error");
        }
    };

    const {
        values,
        errors,
        isLoading: isSubmitting,
        handleChange,
        handleSubmit,
        setFieldValue 
    } = useForm(initialFormValues, validateForm, submitIssueReport);

    const customerIssueTypes = [ "Billing Discrepancy or Inquiry", "Water Leak (Before Meter)", "Water Leak (After Meter - Your Property)", "No Water Supply / Low Pressure", "Water Quality Issue (Color, Odor, Taste)", "Meter Problem (Damaged, Stuck, Inaccurate)", "Online Portal Issue / Account Access", "Request for Service (Disconnection/Reconnection)", "Chatbot Assistance Follow-up", "Other Concern" ];
    const meterReaderIssueTypes = [ "Unable to Access Meter", "Damaged or Tampered Meter Found", "Suspected Illegal Connection", "Route Data Inaccuracy", "Safety Concern on Route", "Device or App Problem", "Customer Inquiry on Field", "Other Field Report" ];
    const clerkIssueTypes = [ "Payment Posting Issue", "Customer Account Inquiry", "Bill Printing Problem", "System Access/Login Issue", "Other Office Concern"];
    const adminIssueTypes = [ "User Role/Permission Change Request", "Data Correction Request", "System Bug Report", "Feature Request", "Urgent System Alert"];
    
    const [availableIssueTypes, setAvailableIssueTypes] = useState(customerIssueTypes);

    useEffect(() => {
        switch (userData?.role) {
            case 'meter_reader':
                setAvailableIssueTypes(meterReaderIssueTypes);
                break;
            case 'clerk_cashier':
                setAvailableIssueTypes(clerkIssueTypes);
                break;
            case 'admin':
                 setAvailableIssueTypes(adminIssueTypes);
                 break;
            default:
                setAvailableIssueTypes(customerIssueTypes);
        }
         setFieldValue('issueType', '');
    }, [userData.role, setFieldValue]);
    
    useEffect(() => {
        setFieldValue('issueAddress', getInitialAddress());
    }, [userData, setFieldValue]);

    const handleAiCategorize = async () => {
        if (!values.description.trim()) {
            showNotification("Please describe your issue first before using the AI categorizer.", "warning");
            return;
        }
        setIsAiCategorizing(true);
        try {
            const categories = availableIssueTypes.join(', ');
            const prompt = `Based on the following user complaint, which of these categories does it best fit into? Categories: [${categories}]. Respond with only the exact category name from the list and nothing else. Complaint: "${values.description}"`;
            
            const messages = [{ role: 'user', content: prompt }];
            let category = await callDeepseekAPI(messages);
            
            category = category.replace(/["'.*]/g, "").trim(); 

            if (availableIssueTypes.includes(category)) {
                setFieldValue('issueType', category);
                showNotification(`AI suggested category: "${category}"`, "success");
            } else {
                showNotification("AI could not determine a matching category. Please select one manually.", "info");
            }
        } catch (error) {
            const errorMessage = error?.message || "AI categorization failed.";
            showNotification(errorMessage, "error");
        } finally {
            setIsAiCategorizing(false);
        }
    };
    
    const handleAiAssist = async () => {
        if (!values.description.trim()) {
            showNotification("Please provide some keywords or a brief description for the AI to expand upon.", "warning");
            return;
        }
        setIsAiAssisting(true);
        try {
            const prompt = `You are helping a user report an issue to AGWA Water Services. Elaborate on the following user-provided details to create a clear, detailed, and formal issue description. Be polite and include any relevant questions the user might need to answer. Do not add any extra commentary, just provide the refined description.\n\nUser's input: "${values.description}"`;
            
            const messages = [{ role: 'user', content: prompt }];
            const assistedDescription = await callDeepseekAPI(messages);
            
            setFieldValue('description', assistedDescription);
            showNotification("AI has helped draft your issue description!", "success");
        } catch (error) {
            const errorMessage = error?.message || "AI assistance failed.";
            showNotification(errorMessage, "error");
        } finally {
            setIsAiAssisting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <AlertTriangle size={30} className="mr-3 text-orange-500" /> Report an Issue or Concern
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="issueType" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <ListChecks size={16} className="mr-1.5 text-gray-500" /> Issue Type / Category *
                    </label>
                    <div className="flex gap-2 items-center">
                        <select
                            id="issueType"
                            name="issueType"
                            value={values.issueType}
                            onChange={handleChange}
                            className={`${commonInputClass} ${errors.issueType ? 'border-red-500' : ''}`}
                        >
                            <option value="" disabled>Select the type of issue...</option>
                            {availableIssueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <Tooltip text="Let AI suggest a category based on your description below.">
                            <button type="button" onClick={handleAiCategorize} className={`${commonButtonClass} w-auto bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-300 px-3`} disabled={isAiCategorizing || isSubmitting}>
                                 {isAiCategorizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16}/>}
                            </button>
                        </Tooltip>
                    </div>
                    {errors.issueType && <p className="text-red-500 text-xs mt-1">{errors.issueType}</p>}
                </div>

                <div>
                    <label htmlFor="issueAddress" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <MapPin size={16} className="mr-1.5 text-gray-500" /> Address / Location of Issue *
                    </label>
                    <input
                        type="text"
                        id="issueAddress"
                        name="issueAddress"
                        value={values.issueAddress}
                        onChange={handleChange}
                        className={`${commonInputClass} ${errors.issueAddress ? 'border-red-500' : ''}`}
                        placeholder="E.g., Your service address, specific street, or account number if general"
                    />
                    {errors.issueAddress && <p className="text-red-500 text-xs mt-1">{errors.issueAddress}</p>}
                </div>
                
                <div>
                     <div className="flex justify-between items-center mb-1">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center">
                            <MessageCircle size={16} className="mr-1.5 text-gray-500" /> Detailed Description of Issue *
                        </label>
                        <Tooltip text={!values.description.trim() ? "Write a description first to enable AI Assist" : "Use AI to help draft or refine your description."}>
                            <button
                                type="button"
                                onClick={handleAiAssist} 
                                className={`${commonButtonClass} text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-300 py-1.5 px-3`}
                                disabled={isAiAssisting || isSubmitting || !values.description.trim()}
                            >
                                {isAiAssisting ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <Sparkles size={16} className="mr-1.5" />}
                                {isAiAssisting ? 'Drafting...' : 'AI Assist'}
                            </button>
                        </Tooltip>
                    </div>
                    <textarea
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        rows="6"
                        className={`${commonInputClass} ${errors.description ? 'border-red-500' : ''}`}
                        placeholder="Please provide as much detail as possible: What is the problem? When did it start? Any specific error messages or observations?"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div className="pt-3">
                    <button
                        type="submit"
                        className={`${commonButtonClass} w-full bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400`}
                        disabled={isSubmitting || isAiAssisting || isAiCategorizing}
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                        {isSubmitting ? 'Submitting Report...' : 'Submit Issue Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportIssueSection;