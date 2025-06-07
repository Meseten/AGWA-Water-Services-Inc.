// src/hooks/useForm.js
import { useState, useCallback } from 'react';

function useForm(initialValues, validate, onSubmit) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        setValues(prevValues => ({
            ...prevValues,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: undefined,
            }));
        }
    }, [errors]);

    const setFieldValue = useCallback((name, value) => {
        setValues(prevValues => ({
            ...prevValues,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: undefined,
            }));
        }
    }, [errors]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsLoading(false);
        setIsSubmitting(false);
    }, [initialValues]);

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setIsLoading(true);
        setErrors({});

        let currentErrors = {};
        if (validate) {
            currentErrors = validate(values);
            setErrors(currentErrors);
        }

        if (Object.keys(currentErrors).length === 0) {
            try {
                if (onSubmit) {
                    await onSubmit(values, resetForm);
                }
            } catch (submitError) {
                console.error("Form submission error:", submitError);
                setErrors(prevErrors => ({
                    ...prevErrors,
                    submit: submitError.message || "An unexpected error occurred during submission."
                }));
            }
        }
        
        setIsLoading(false);
        setIsSubmitting(false);
    };

    return {
        values,
        setValues,
        setFieldValue,
        errors,
        setErrors,
        isLoading,
        handleChange,
        handleSubmit,
        resetForm,
    };
}

export default useForm;