-- Create LGAs (Local Government Areas) table
CREATE TABLE IF NOT EXISTS lgas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Wards table
CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lga_id INTEGER NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lga_id, name),
  UNIQUE(lga_id, code)
);

-- Create Polling Units table
CREATE TABLE IF NOT EXISTS polling_units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ward_id INTEGER NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  code VARCHAR(30) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ward_id, name),
  UNIQUE(ward_id, code)
);

-- Insert Niger State LGAs
INSERT INTO lgas (name, code) VALUES
('Agaie', 'AGA'),
('Agwara', 'AGW'),
('Bida', 'BID'),
('Borgu', 'BOR'),
('Bosso', 'BOS'),
('Chanchaga', 'CHA'),
('Edati', 'EDA'),
('Gbako', 'GBA'),
('Gurara', 'GUR'),
('Katcha', 'KAT'),
('Kontagora', 'KON'),
('Lapai', 'LAP'),
('Lavun', 'LAV'),
('Magama', 'MAG'),
('Mariga', 'MAR'),
('Mashegu', 'MAS'),
('Mokwa', 'MOK'),
('Munya', 'MUN'),
('Paikoro', 'PAI'),
('Rafi', 'RAF'),
('Rijau', 'RIJ'),
('Shiroro', 'SHI'),
('Suleja', 'SUL'),
('Tafa', 'TAF'),
('Wushishi', 'WUS')
ON CONFLICT (name) DO NOTHING;
