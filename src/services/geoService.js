
const qcDistricts = {
    "District 1": ["Alicia", "Bago Bantay", "Bagong Pag-asa", "Bungad", "Damar", "Damayan", "Del Monte", "Katipunan", "Mariblo", "Masambong", "N.S. Amoranto", "Paltok", "Paraiso", "Phil-Am", "Project 6", "Ramon Magsaysay", "Saint Peter", "San Antonio", "San Isidro Labrador", "San Jose", "Santa Cruz", "Santa Teresita", "Siena", "Talayan", "Vasra", "Veterans Village", "West Triangle"],
    "District 2": ["Bagong Silangan", "Batasan Hills", "Commonwealth", "Holy Spirit", "Payatas"],
    "District 3": ["Amihan", "Bagumbayan", "Bagumbuhay", "Bayanihan", "Blue Ridge A", "Blue Ridge B", "Camp Aguinaldo", "Claro", "Dioquino Zobel", "Duyan-duyan", "E. Rodriguez", "East Kamias", "Escopa I", "Escopa II", "Escopa III", "Escopa IV", "Libis", "Loyola Heights", "Mangga", "Marilag", "Masagana", "Matandang Balara", "Milagrosa", "Pansol", "Quirino 2-A", "Quirino 2-B", "Quirino 2-C", "Quirino 3-A", "St. Ignatius", "San Roque", "Silangan", "Socorro", "Tagumpay", "Ugong Norte", "West Kamias", "White Plains"],
    "District 4": ["Bagong Lipunan ng Crame", "Botocan", "Central", "Damayang Lagi", "Don Manuel", "Doña Aurora", "Doña Imelda", "Doña Josefa", "Horseshoe", "Immaculate Conception", "Kalusugan", "Kamuning", "Kaunlaran", "Kristong Hari", "Krus na Ligas", "Laging Handa", "Malaya", "Mariana", "Obrero", "Old Capitol Site", "Paligsahan", "Pinyahan", "Pinagkaisahan", "Roxas", "Sacred Heart", "San Isidro Galas", "San Martin de Porres", "San Vicente", "Santol", "Sikatuna Village", "South Triangle", "Sto. Niño", "Tatalon", "Teacher's Village East", "Teacher's Village West", "U.P. Campus", "U.P. Village", "Valencia"],
    "District 5": ["Bagbag", "Capri", "Fairview", "Gulod", "Greater Lagro", "Kaligayahan", "Nagkaisang Nayon", "North Fairview", "Novaliches Proper", "Pasong Putik Proper", "San Agustin", "San Bartolome", "Sta. Lucia", "Sta. Monica"],
    "District 6": ["Apolonio Samson", "Baesa", "Balon Bato", "Culiat", "New Era", "Pasong Tamo", "Sangandaan", "Sauyo", "Talipapa", "Tandang Sora", "Unang Sigaw"]
};

export const getDistricts = () => Object.keys(qcDistricts);

export const getBarangaysInDistrict = (district) => qcDistricts[district] || [];