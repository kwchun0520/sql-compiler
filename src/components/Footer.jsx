function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-solid border-[var(--border-color)] px-6 py-4 text-center w-full overflow-hidden">
      <p className="text-sm text-[var(--text-secondary)] m-0">Copyright ⓒ {year}</p>
    </footer>
  );
}

export default Footer;
