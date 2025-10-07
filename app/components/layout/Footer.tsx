import { Button } from "../ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-4 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="mb-4">
            <img 
              src="/logo-tangible.svg" 
              alt="Tangible" 
              className="h-6 w-auto"
            />
          </div>
          <div className="text-xs mb-4">Discover and explore civic initiatives that make a real difference in your community.</div>
        </div>
        <div>
          <div className="font-bold mb-2">Navigation</div>
          <ul className="text-xs space-y-1">
            <li><a href="#" className="hover:underline">Discover</a></li>
            <li><a href="#" className="hover:underline">Categories</a></li>
            <li><a href="#" className="hover:underline">Community</a></li>
            <li><a href="#" className="hover:underline">About</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-2">Resources</div>
          <ul className="text-xs space-y-1">
            <li><a href="#" className="hover:underline">Writing Guide</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Impact Studies</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-2">Newsletter</div>
          <div className="text-xs mb-2">Get the latest trends and insights delivered directly to your inbox.</div>
          <form className="flex gap-2">
            <input type="email" placeholder="Your email" className="px-2 py-1 rounded text-gray-900" />
            <Button variant="primary">Subscribe</Button>
          </form>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-500 text-center">
        © 2024 Tangible. All rights reserved. | Legal | Privacy | Terms
      </div>
    </footer>
  );
}