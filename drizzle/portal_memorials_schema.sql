-- Portal da Lembrança - Esquema de Banco de Dados (PostgreSQL 14+)
-- Este script cria o schema completo, incluindo tipos enumerados, tabelas,
-- constraints, índices e gatilhos de atualização de timestamp.

-- Extensão necessária para e-mails case-insensitive
CREATE EXTENSION IF NOT EXISTS citext;

-- Tipos enumerados
CREATE TYPE memorial_visibility AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE memorial_status AS ENUM ('PENDING_FAMILY_DATA', 'ACTIVE', 'INACTIVE');
CREATE TYPE subscription_plan AS ENUM ('ANNUAL', 'LIFETIME');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- Função e gatilho para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela: funeral_homes
CREATE TABLE funeral_homes (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  trade_name    TEXT,
  email         CITEXT      NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  phone         TEXT,
  address       TEXT,
  city          TEXT        NOT NULL,
  state         TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE funeral_homes IS 'Cadastro de funerárias parceiras ou originadoras de memoriais.';
COMMENT ON COLUMN funeral_homes.email IS 'E-mail único usado para login da funerária.';

CREATE TRIGGER trg_funeral_homes_updated
BEFORE UPDATE ON funeral_homes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: family_users
CREATE TABLE family_users (
  id            BIGSERIAL PRIMARY KEY,
  full_name     TEXT        NOT NULL,
  email         CITEXT      NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE family_users IS 'Usuários responsáveis pela gestão do memorial dentro da família.';
COMMENT ON COLUMN family_users.email IS 'E-mail único usado para login do responsável da família.';

CREATE TRIGGER trg_family_users_updated
BEFORE UPDATE ON family_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: memorials
CREATE TABLE memorials (
  id               BIGSERIAL PRIMARY KEY,
  slug             TEXT              NOT NULL UNIQUE,
  full_name        TEXT              NOT NULL,
  birth_date       DATE,
  death_date       DATE,
  birthplace       TEXT,
  parents          TEXT,
  biography        TEXT,
  visibility       memorial_visibility NOT NULL DEFAULT 'PUBLIC',
  status           memorial_status     NOT NULL DEFAULT 'PENDING_FAMILY_DATA',
  funeral_home_id  BIGINT REFERENCES funeral_homes(id) ON DELETE SET NULL,
  family_user_id   BIGINT REFERENCES family_users(id)  ON DELETE SET NULL,
  qr_code_url      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE memorials IS 'Memoriais digitais de pessoas falecidas ou túmulos históricos.';
COMMENT ON COLUMN memorials.slug IS 'Identificador curto usado na URL pública (ex.: /m/{slug}).';
COMMENT ON COLUMN memorials.visibility IS 'Define se o memorial é público ou privado.';
COMMENT ON COLUMN memorials.status IS 'Estado operacional do memorial (pendente, ativo ou inativo).';

CREATE INDEX idx_memorials_funeral_home_id ON memorials(funeral_home_id);
CREATE INDEX idx_memorials_family_user_id  ON memorials(family_user_id);

CREATE TRIGGER trg_memorials_updated
BEFORE UPDATE ON memorials
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: cemeteries
CREATE TABLE cemeteries (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  address     TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  state       TEXT        NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE cemeteries IS 'Cadastro de cemitérios usados na catalogação de túmulos históricos.';

CREATE TRIGGER trg_cemeteries_updated
BEFORE UPDATE ON cemeteries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: historical_graves
CREATE TABLE historical_graves (
  id                  BIGSERIAL PRIMARY KEY,
  cemetery_id         BIGINT      NOT NULL REFERENCES cemeteries(id) ON DELETE CASCADE,
  memorial_id         BIGINT      REFERENCES memorials(id) ON DELETE SET NULL,
  person_name         TEXT        NOT NULL,
  known_as            TEXT,
  description         TEXT,
  location_reference  TEXT,
  is_popular_devotion BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE historical_graves IS 'Túmulos de relevância histórica ou cultural catalogados nos cemitérios.';

CREATE INDEX idx_historical_graves_cemetery_id ON historical_graves(cemetery_id);

CREATE TRIGGER trg_historical_graves_updated
BEFORE UPDATE ON historical_graves
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: descendants
CREATE TABLE descendants (
  id                 BIGSERIAL PRIMARY KEY,
  memorial_id        BIGINT      NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  full_name          TEXT        NOT NULL,
  relationship_degree TEXT       NOT NULL,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE descendants IS 'Descendentes ligados a um memorial (filhos, netos, etc.).';

CREATE TRIGGER trg_descendants_updated
BEFORE UPDATE ON descendants
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: photos
CREATE TABLE photos (
  id            BIGSERIAL PRIMARY KEY,
  memorial_id   BIGINT      NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  file_url      TEXT        NOT NULL,
  caption       TEXT,
  display_order INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE photos IS 'Fotos associadas ao memorial.';

CREATE TRIGGER trg_photos_updated
BEFORE UPDATE ON photos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabela: dedications
CREATE TABLE dedications (
  id          BIGSERIAL PRIMARY KEY,
  memorial_id BIGINT      NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  author_name TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE dedications IS 'Mensagens e dedicatórias deixadas no memorial.';

-- Tabela: access_logs
CREATE TABLE access_logs (
  id          BIGSERIAL PRIMARY KEY,
  memorial_id BIGINT      NOT NULL REFERENCES memorials(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source      TEXT        NOT NULL,
  user_agent  TEXT,
  ip_address  TEXT
);
COMMENT ON TABLE access_logs IS 'Registros de acesso aos memoriais (QR code, link direto, etc.).';

CREATE INDEX idx_access_logs_memorial_id ON access_logs(memorial_id);

-- Tabela: subscriptions
CREATE TABLE subscriptions (
  id           BIGSERIAL PRIMARY KEY,
  memorial_id  BIGINT             NOT NULL UNIQUE REFERENCES memorials(id) ON DELETE CASCADE,
  plan_type    subscription_plan  NOT NULL,
  status       subscription_status NOT NULL,
  start_date   DATE               NOT NULL,
  end_date     DATE,
  price_cents  INTEGER            NOT NULL,
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_price_positive CHECK (price_cents >= 0)
);
COMMENT ON TABLE subscriptions IS 'Controle de assinaturas relacionadas a memoriais.';

CREATE TRIGGER trg_subscriptions_updated
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
