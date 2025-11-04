export const toWaLink = (phone?: string | null) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");

  const withCC = digits.length === 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCC}`;
};
