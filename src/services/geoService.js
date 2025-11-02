const naicDistricts = {
    "Poblacion": ["Capt. C. Nazareno", "Gombalza", "Kanluran", "Ibayo Silangan", "Humbac", "Balsahan"],
    "Baybayin Bayan-Hilaga": ["Timalan Balsahan", "Timalan Concepcion", "Munting Mapino", "Ibayo Estacion", "Latoria", "Bucana Sasahan"],
    "Baybayin Timog": ["Bagong Kalsada", "Bucana Malaki", "Bancaan", "Mabulo", "Labac", "Sapa"],
    "Ilayang Hilaga": ["Calubcob", "Halang", "Palangue Central", "Palangue 2&3", "Sabang", "Makina"],
    "Ilayang Timog": ["Muzon", "Malainen Bago", "Malainen Luma", "Molino", "San Roque", "Santulan"],
};

export const getDistricts = () => Object.keys(naicDistricts);

export const getBarangaysInDistrict = (district) => naicDistricts[district] || [];