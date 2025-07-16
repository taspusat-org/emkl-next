export function highlightText(
  text: string | number | null | undefined,
  search: string,
  columnFilter: string = ''
) {
  const textValue = text !== null && text !== undefined ? String(text) : ''; // Pastikan 0 tidak dianggap falsy
  if (!textValue) return '';

  if (!search.trim() && !columnFilter.trim()) return textValue;

  const combinedSearch = search + columnFilter;

  // Regex untuk mencari setiap huruf dari combinedSearch dan mengganti dengan elemen <span> dengan background yellow dan font-size 12px
  const regex = new RegExp(`(${combinedSearch})`, 'gi');

  // Ganti semua kecocokan dengan elemen JSX
  const highlightedText = textValue.replace(
    regex,
    (match) =>
      `<span style="background-color: yellow; font-size: 13px">${match}</span>`
  );

  return (
    <span
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
}
