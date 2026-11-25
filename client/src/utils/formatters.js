// Currency formatter for Pakistani Rupees
export const formatPKR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₨ 0';
  return '₨ ' + Number(amount).toLocaleString('en-PK', {
    maximumFractionDigits: 0
  });
};

// Date formatter (DD MMM YYYY)
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format Pakistani CNIC (XXXXX-XXXXXXX-X)
export const formatCNIC = (cnic) => {
  if (!cnic) return '-';
  const clean = cnic.replace(/\D/g, '');
  if (clean.length === 13) {
    return `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12)}`;
  }
  return cnic;
};

