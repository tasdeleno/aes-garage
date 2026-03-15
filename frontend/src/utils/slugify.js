const turkishMap = {
  'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g',
  'İ': 'i', 'Ö': 'o', 'Ü': 'u', 'Ş': 's', 'Ç': 'c', 'Ğ': 'g',
};

export default function slugify(text) {
  if (!text) return '';
  return text
    .replace(/[ıöüşçğİÖÜŞÇĞ]/g, ch => turkishMap[ch] || ch)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
