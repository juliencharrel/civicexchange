import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import ProfileForm from './ProfileForm';

// Forcer le rendu dynamique pour éviter les erreurs de cookies
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles
          </p>
        </div>
        
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
