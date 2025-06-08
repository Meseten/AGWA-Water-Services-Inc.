
/**
 * Calculates detailed water bill charges based on consumption, service type, and meter size.
 * This logic is based on the rates provided in the AGWA tariff structure.
 *
 * @param {number} consumption - Water consumption in cubic meters (cu.m.).
 * @param {string} serviceType - The type of service (e.g., 'Residential', 'Commercial', 'Residential Low-Income').
 * @param {string} [meterSize='1/2"'] - The size of the water meter (e.g., '1/2"', '15mm', '1"').
 * @param {object} [systemSettingsInput={}] - System settings object containing rates.
 * @param {number} [systemSettingsInput.fcdaPercentage=1.29]
 * @param {number} [systemSettingsInput.environmentalChargePercentage=25]
 * @param {number} [systemSettingsInput.sewerageChargePercentageCommercial=32.85]
 * @param {number} [systemSettingsInput.governmentTaxPercentage=2]
 * @param {number} [systemSettingsInput.vatPercentage=12]
 * @returns {object} An object containing all calculated charges and totals.
 */
export const calculateBillDetails = (
    consumption,
    serviceType,
    meterSize = '1/2"',
    systemSettingsInput = {}
) => {
    let basicCharge = 0;
    let fcda = 0;
    let environmentalCharge = 0;
    let sewerageCharge = 0;
    let maintenanceServiceCharge = 0;
    let governmentTaxes = 0;
    let vat = 0;
    let waterCharge = 0;

    const cons = parseFloat(consumption) || 0;

    const defaultSettings = {
        fcdaPercentage: 1.29,
        environmentalChargePercentage: 25,
        sewerageChargePercentageCommercial: 32.85,
        governmentTaxPercentage: 2,
        vatPercentage: 12,
    };

    const settings = { ...defaultSettings, ...systemSettingsInput };

    const fcdaRate = (settings.fcdaPercentage || defaultSettings.fcdaPercentage) / 100;
    const ecRate = (settings.environmentalChargePercentage || defaultSettings.environmentalChargePercentage) / 100;
    const scRateCommercial = (settings.sewerageChargePercentageCommercial || defaultSettings.sewerageChargePercentageCommercial) / 100;
    const govTaxRate = (settings.governmentTaxPercentage || defaultSettings.governmentTaxPercentage) / 100;
    const vatRate = (settings.vatPercentage || defaultSettings.vatPercentage) / 100;


    const meterSizeCleaned = String(meterSize).replace(/["“”]/g, '').trim();
    if (meterSizeCleaned === '1/2' || meterSizeCleaned === '15mm') maintenanceServiceCharge = 1.50;
    else if (meterSizeCleaned === '3/4' || meterSizeCleaned === '20mm') maintenanceServiceCharge = 2.00;
    else if (meterSizeCleaned === '1' || meterSizeCleaned === '25mm') maintenanceServiceCharge = 3.00;
    else if (meterSizeCleaned === '1 1/4' || meterSizeCleaned === '40mm') maintenanceServiceCharge = 4.00;
    else if (meterSizeCleaned === '1 1/2' || meterSizeCleaned === '32mm') maintenanceServiceCharge = 4.00;
    else if (meterSizeCleaned === '2' || meterSizeCleaned === '50mm') maintenanceServiceCharge = 6.00;
    else if (meterSizeCleaned === '3' || meterSizeCleaned === '75mm') maintenanceServiceCharge = 10.00;
    else if (meterSizeCleaned === '4' || meterSizeCleaned === '100mm') maintenanceServiceCharge = 20.00;
    else if (meterSizeCleaned === '6' || meterSizeCleaned === '150mm') maintenanceServiceCharge = 35.00;
    else if (meterSizeCleaned === '8' || meterSizeCleaned === '200mm') maintenanceServiceCharge = 50.00;
    else maintenanceServiceCharge = 1.50;


    // Basic Charge Calculation (based on original AGWA PDF logic - tariff rates hardcoded here)
    // These tariff step rates are typically fixed by regulation and change less frequently than percentages.
    // If these also need to be dynamic, the data structure for systemSettings would need to be more complex.
    if (serviceType === 'Residential Low-Income') {
        if (cons <= 10) basicCharge = 70.07;
        else if (cons <= 20) basicCharge = 70.07 + (cons - 10) * 14.29;
        else { 
            basicCharge = 70.07 + (10 * 14.29); 
            let remainingCons = cons - 20;
            if (remainingCons > 0) {
                 if (remainingCons <=10) basicCharge += remainingCons * 23.82; 
                 else if (remainingCons <=20) basicCharge += (10*23.82) + (remainingCons-10)*45.17; 
                 else basicCharge += (10*23.82) + (10*45.17) + (remainingCons-20)*59.54;
            }
        }
    } else if (serviceType === 'Residential') {
        if (cons <= 10) basicCharge = 195.49;
        else if (cons <= 20) basicCharge = 195.49 + (cons - 10) * 23.82;
        else if (cons <= 30) basicCharge = 195.49 + (10 * 23.82) + (cons - 20) * 45.17;
        else if (cons <= 50) basicCharge = 195.49 + (10 * 23.82) + (10 * 45.17) + (cons - 30) * 59.54;
        else if (cons <= 70) basicCharge = 195.49 + (10*23.82) + (10*45.17) + (20*59.54) + (cons-50)*69.52;
        else if (cons <= 90) basicCharge = 195.49 + (10*23.82) + (10*45.17) + (20*59.54) + (20*69.52) + (cons-70)*72.89;
        else if (cons <= 140) basicCharge = 195.49 + (10*23.82) + (10*45.17) + (20*59.54) + (20*69.52) + (20*72.89) + (cons-90)*76.14;
        else if (cons <= 200) basicCharge = 195.49 + (10*23.82) + (10*45.17) + (20*59.54) + (20*69.52) + (20*72.89) + (50*76.14) + (cons-140)*79.42;
        else basicCharge = 195.49 + (10*23.82) + (10*45.17) + (20*59.54) + (20*69.52) + (20*72.89) + (50*76.14) + (60*79.42) + (cons-200)*82.67;
    } else if (serviceType === 'Semi-Business') { 
        if (cons <= 10) {
            basicCharge = 195.49; 
        } else { 
            basicCharge = 195.49; 
            let excessCons = cons - 10;
            if (excessCons <= 10) basicCharge += excessCons * 39.90; 
            else if (excessCons <= 30) basicCharge += (10 * 39.90) + (excessCons - 10) * 49.22; 
            else if (excessCons <= 50) basicCharge += (10 * 39.90) + (20 * 49.22) + (excessCons - 30) * 62.55; 
            else if (excessCons <= 70) basicCharge += (10*39.90) + (20*49.22) + (20*62.55) + (excessCons-50)*72.88;
            else if (excessCons <= 120) basicCharge += (10*39.90) + (20*49.22) + (20*62.55) + (20*72.88) + (excessCons-70)*76.14;
            else if (excessCons <= 170) basicCharge += (10*39.90) + (20*49.22) + (20*62.55) + (20*72.88) + (50*76.14) + (excessCons-120)*79.42;
            else basicCharge += (10*39.90) + (20*49.22) + (20*62.55) + (20*72.88) + (50*76.14) + (50*79.42) + (excessCons-170)*82.67;
        }
    } else if (serviceType === 'Commercial' || serviceType === 'Admin') { // Business Group I
        const tiers = [ /* ... (same as before) ... */ ]; // Tariff tiers remain hardcoded for now
        let remainingCons = cons; basicCharge = 0;
        if (remainingCons > 0 && tiers[0].fixed) { basicCharge += tiers[0].fixed; remainingCons -= tiers[0].limit; }
        for (let i = 1; i < tiers.length; i++) { if (remainingCons <= 0) break; const prevLimit = tiers[i-1].limit; const currentTierConsumptionCap = tiers[i].limit - prevLimit; const chargeableCons = Math.min(remainingCons, currentTierConsumptionCap); basicCharge += chargeableCons * tiers[i].rate; remainingCons -= chargeableCons; }
    } else if (serviceType === 'Industrial' || serviceType === 'Meter Reading Personnel') { // Business Group II
        const tiers = [ /* ... (same as before) ... */ ]; // Tariff tiers remain hardcoded for now
        let remainingCons = cons; basicCharge = 0;
        if (remainingCons > 0 && tiers[0].fixed) { basicCharge += tiers[0].fixed; remainingCons -= tiers[0].limit; }
        for (let i = 1; i < tiers.length; i++) { if (remainingCons <= 0) break; const prevLimit = tiers[i-1].limit; const currentTierConsumptionCap = tiers[i].limit - prevLimit; const chargeableCons = Math.min(remainingCons, currentTierConsumptionCap); basicCharge += chargeableCons * tiers[i].rate; remainingCons -= chargeableCons; }
    } else { 
        if (cons <= 10) basicCharge = 195.49; else basicCharge = 195.49 + (cons - 10) * 23.82;
    }

    fcda = basicCharge * fcdaRate;
    waterCharge = basicCharge + fcda;
    environmentalCharge = waterCharge * ecRate;

    if (serviceType === 'Commercial' || serviceType === 'Industrial' || serviceType === 'Admin' || serviceType === 'Meter Reading Personnel') {
        sewerageCharge = waterCharge * scRateCommercial;
    } else { 
        sewerageCharge = 0;
    }

    const sumForGovTaxAndVat = waterCharge + environmentalCharge + sewerageCharge + maintenanceServiceCharge;
    governmentTaxes = sumForGovTaxAndVat * govTaxRate;
    
    const vatableSales = sumForGovTaxAndVat; // Base for VAT calculation
    vat = vatableSales * vatRate;

    const totalCalculatedCharges = vatableSales + governmentTaxes + vat;

    return {
        consumption: cons, serviceType, meterSize: meterSizeCleaned,
        basicCharge: parseFloat(basicCharge.toFixed(2)),
        fcda: parseFloat(fcda.toFixed(2)),
        waterCharge: parseFloat(waterCharge.toFixed(2)),
        environmentalCharge: parseFloat(environmentalCharge.toFixed(2)),
        sewerageCharge: parseFloat(sewerageCharge.toFixed(2)),
        maintenanceServiceCharge: parseFloat(maintenanceServiceCharge.toFixed(2)),
        subTotalBeforeTaxes: parseFloat(vatableSales.toFixed(2)),
        governmentTaxes: parseFloat(governmentTaxes.toFixed(2)),
        vatableSales: parseFloat(vatableSales.toFixed(2)),
        vat: parseFloat(vat.toFixed(2)),
        totalCalculatedCharges: parseFloat(totalCalculatedCharges.toFixed(2)),
    };
};
