export default function Footer() {
  return (
    <footer className="text-center py-6 border-gray-200 bg-gray-50 text-sm text-gray-500">
      © {new Date().getFullYear()}{" "}
      <span className="font-semibold text-gray-800">Automatech Systems</span>
    </footer>
  );
}
