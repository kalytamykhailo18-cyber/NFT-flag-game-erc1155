/**
 * Footer - Site footer with links
 */
const Footer = () => {
  return (
    <footer className="bg-dark-lighter border-t border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-200 text-sm">
            PlaceNFT - Collect unique place NFTs from around the world
          </div>
          <div className="flex gap-6 text-gray-200 text-sm">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">FAQ</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
