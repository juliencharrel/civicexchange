import Button from "./ui/Button";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-4 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-bold mb-2">Systèmes d&apos;Ailleurs</div>
          <div className="text-xs mb-4">La plateforme qui transforme l&apos;expérience des agents en force de changement pour la France.</div>
        </div>
        <div>
          <div className="font-bold mb-2">Navigation</div>
          <ul className="text-xs space-y-1">
            <li><a href="#" className="hover:underline">Découvrir</a></li>
            <li><a href="#" className="hover:underline">Catégories</a></li>
            <li><a href="#" className="hover:underline">Communauté</a></li>
            <li><a href="#" className="hover:underline">À propos</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-2">Ressources</div>
          <ul className="text-xs space-y-1">
            <li><a href="#" className="hover:underline">Guide d&apos;écriture</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
            <li><a href="#" className="hover:underline">Études d&apos;impact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-bold mb-2">Newsletter</div>
          <div className="text-xs mb-2">Recevez les dernières tendances et retours d&apos;expérience directement dans votre boîte mail.</div>
          <form className="flex gap-2">
            <input type="email" placeholder="Votre email" className="px-2 py-1 rounded text-gray-900" />
            <Button variant="primary">S&apos;inscrire</Button>
          </form>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-500 text-center">
        © 2024 Systèmes d&apos;Ailleurs. Tous droits réservés. | Mentions légales | Confidentialité | CGU
      </div>
    </footer>
  );
}