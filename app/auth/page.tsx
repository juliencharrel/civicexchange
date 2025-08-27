'use client';

import { Auth } from '@supabase/auth-ui-react';
import { createClient } from '../../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const supabase = createClient();

export default function AuthPage() {
  const { user } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      redirect('/');
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
            CivicExchange
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Rejoignez la communauté des initiatives civiques
          </p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Bienvenue
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Connectez-vous ou créez votre compte pour commencer
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                variables: {
                  default: {
                    colors: {
                      brand: 'var(--color-primary)',
                      brandAccent: 'var(--color-primary-dark)',
                      brandButtonText: '#ffffff',
                      defaultButtonBackground: '#ffffff',
                      defaultButtonBackgroundHover: '#f3f4f6',
                      defaultButtonBorder: '#d1d5db',
                      defaultButtonText: '#374151',
                      dividerBackground: '#e5e7eb',
                      inputBackground: '#ffffff',
                      inputBorder: '#d1d5db',
                      inputBorderHover: '#9ca3af',
                      inputBorderFocus: 'var(--color-primary)',
                      inputText: '#374151',
                      inputLabelText: '#6b7280',
                      anchorTextColor: 'var(--color-primary)',
                      anchorTextHoverColor: 'var(--color-primary-dark)',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    fonts: {
                      bodyFontFamily: 'var(--font-geist-sans)',
                      buttonFontFamily: 'var(--font-geist-sans)',
                      inputFontFamily: 'var(--font-geist-sans)',
                      labelFontFamily: 'var(--font-geist-sans)',
                    },
                  },
                },
                className: {
                  anchor: 'text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium underline-offset-4 hover:underline',
                  button: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 bg-[var(--color-primary)] text-white data-active:bg-[var(--color-primary-dark)] data-hover:bg-[var(--color-primary-light)] h-9 px-4 py-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                  container: 'space-y-4',
                  divider: 'bg-gray-200',
                  input: 'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                  label: 'block text-sm font-medium text-gray-700 mb-1',
                  loader: 'text-[var(--color-primary)]',
                  message: 'text-sm',
                },
              }}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Adresse email',
                    password_label: 'Mot de passe',
                    button_label: 'Se connecter',
                    loading_button_label: 'Connexion en cours...',
                    social_provider_text: 'Continuer avec {{provider}}',
                    link_text: 'Déjà un compte ? Se connecter',
                  },
                  sign_up: {
                    email_label: 'Adresse email',
                    password_label: 'Mot de passe',
                    button_label: 'Créer mon compte',
                    loading_button_label: 'Création en cours...',
                    social_provider_text: 'S\'inscrire avec {{provider}}',
                    link_text: 'Pas de compte ? S\'inscrire',
                  },
                  forgotten_password: {
                    email_label: 'Adresse email',
                    password_label: 'Mot de passe',
                    button_label: 'Envoyer les instructions',
                    loading_button_label: 'Envoi en cours...',
                    link_text: 'Mot de passe oublié ?',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            En continuant, vous acceptez nos{' '}
            <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium underline-offset-4 hover:underline">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium underline-offset-4 hover:underline">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
