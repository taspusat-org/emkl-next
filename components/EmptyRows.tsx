export function EmptyRowsRenderer() {
  return (
    <div
      className="flex h-fit w-full items-center justify-center border border-l-0 border-t-0 border-blue-500 py-1"
      style={{ textAlign: 'center', gridColumn: '1/-1' }}
    >
      <p className="text-gray-400">NO ROWS DATA FOUND</p>
    </div>
  );
}
