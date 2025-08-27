import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Erreur d'authentification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Une erreur s'est produite lors de l'authentification
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Problème de connexion</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Le lien d'authentification a expiré ou est invalide. 
              Veuillez réessayer de vous connecter.
            </p>
            <Link href="/auth">
              <Button className="w-full">
                Retour à la page de connexion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
