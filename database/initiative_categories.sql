-- Création de la table des catégories d'initiatives
CREATE TABLE IF NOT EXISTS initiative_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE initiative_categories ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : tout le monde peut lire
CREATE POLICY "Categories are viewable by everyone" ON initiative_categories
  FOR SELECT USING (true);

-- Politique d'écriture : seulement les admins peuvent modifier
CREATE POLICY "Categories are editable by admins only" ON initiative_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insertion des catégories de base
INSERT INTO initiative_categories (name, keywords, icon) VALUES
  ('Mobility / Transport', ARRAY['transport', 'mobility', 'vélo', 'bike', 'bus', 'train', 'métro', 'subway', 'voiture', 'car', 'parking', 'route', 'road', 'traffic', 'circulation', 'mobilité', 'déplacement'], '🚲'),
  ('Environment / Ecology', ARRAY['environment', 'ecology', 'écologie', 'environnement', 'green', 'vert', 'sustainable', 'durable', 'recycling', 'recyclage', 'waste', 'déchet', 'pollution', 'air', 'water', 'eau', 'energy', 'énergie', 'renewable', 'renouvelable', 'biodiversity', 'biodiversité'], '🌿'),
  ('Culture / Arts', ARRAY['culture', 'arts', 'art', 'musique', 'music', 'theatre', 'théâtre', 'cinema', 'cinéma', 'museum', 'musée', 'exhibition', 'exposition', 'festival', 'concert', 'dance', 'danse', 'literature', 'littérature', 'heritage', 'patrimoine'], '🎨'),
  ('Social / Solidarity', ARRAY['social', 'solidarity', 'solidarité', 'community', 'communauté', 'help', 'aide', 'support', 'soutien', 'charity', 'charité', 'volunteer', 'bénévolat', 'inclusion', 'integration', 'intégration', 'equality', 'égalité', 'diversity', 'diversité'], '🤝'),
  ('Education / Youth', ARRAY['education', 'youth', 'jeunesse', 'école', 'school', 'university', 'université', 'training', 'formation', 'learning', 'apprentissage', 'student', 'étudiant', 'child', 'enfant', 'pedagogy', 'pédagogie', 'skill', 'compétence'], '🎓'),
  ('Health / Well-being', ARRAY['health', 'well-being', 'bien-être', 'medical', 'médical', 'hospital', 'hôpital', 'doctor', 'médecin', 'nurse', 'infirmier', 'mental', 'psychology', 'psychologie', 'fitness', 'sport', 'nutrition', 'alimentation', 'prevention', 'prévention'], '💚'),
  ('Urban Planning / Development', ARRAY['urban', 'planning', 'aménagement', 'development', 'développement', 'city', 'ville', 'neighborhood', 'quartier', 'infrastructure', 'construction', 'building', 'bâtiment', 'public space', 'espace public', 'park', 'parc', 'square', 'place'], '🏙️'),
  ('Economy / Entrepreneurship', ARRAY['economy', 'entrepreneurship', 'entrepreneuriat', 'business', 'commerce', 'job', 'emploi', 'work', 'travail', 'startup', 'company', 'entreprise', 'market', 'marché', 'trade', 'commerce', 'finance', 'investment', 'investissement'], '💼'),
  ('Innovation / Tech', ARRAY['innovation', 'tech', 'technology', 'technologie', 'digital', 'numérique', 'smart', 'intelligent', 'AI', 'artificial intelligence', 'intelligence artificielle', 'data', 'données', 'app', 'application', 'software', 'logiciel', 'hardware', 'matériel'], '💡'),
  ('Governance / Civic', ARRAY['governance', 'civic', 'citoyen', 'citizen', 'democracy', 'démocratie', 'vote', 'voting', 'election', 'élection', 'government', 'gouvernement', 'policy', 'politique', 'public service', 'service public', 'administration', 'transparency', 'transparence'], '🏛️'),
  ('Safety / Security', ARRAY['safety', 'security', 'sécurité', 'police', 'fire', 'pompier', 'emergency', 'urgence', 'protection', 'crime', 'criminalité', 'prevention', 'prévention', 'law', 'loi', 'justice', 'legal', 'légal'], '🛡️'),
  ('Leisure / Sports', ARRAY['leisure', 'sports', 'sport', 'recreation', 'récréation', 'game', 'jeu', 'play', 'jouer', 'entertainment', 'divertissement', 'hobby', 'passe-temps', 'activity', 'activité', 'club', 'association', 'team', 'équipe'], '⚽')
ON CONFLICT (name) DO NOTHING;

-- Mise à jour de la table initiatives pour ajouter category_id
ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES initiative_categories(id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_initiatives_category_id ON initiatives(category_id);
CREATE INDEX IF NOT EXISTS idx_initiative_categories_name ON initiative_categories(name);
