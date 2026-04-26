
-- 1. Tabla de diagramas
CREATE TABLE IF NOT EXISTS diagrams (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL DEFAULT 'Untitled Diagram',
  description TEXT,
  nodes       JSONB       NOT NULL DEFAULT '[]',
  edges       JSONB       NOT NULL DEFAULT '[]',
  share_slug  TEXT        UNIQUE,
  is_public   BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS diagrams_user_id_idx   ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS diagrams_share_slug_idx ON diagrams(share_slug);

-- 3. Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_diagrams_updated_at
  BEFORE UPDATE ON diagrams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security (RLS)
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven sus propios diagramas
CREATE POLICY "Users can view own diagrams"
  ON diagrams FOR SELECT
  USING (auth.uid() = user_id);

-- Diagramas públicos visibles para todos
CREATE POLICY "Public diagrams viewable by all"
  ON diagrams FOR SELECT
  USING (is_public = true);

-- Solo el dueño puede insertar
CREATE POLICY "Users can insert own diagrams"
  ON diagrams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede actualizar
CREATE POLICY "Users can update own diagrams"
  ON diagrams FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo el dueño puede eliminar
CREATE POLICY "Users can delete own diagrams"
  ON diagrams FOR DELETE
  USING (auth.uid() = user_id);
