-- Add actual Niger State LGAs and sample wards data
-- Insert all 25 LGAs of Niger State
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

-- Insert sample wards for major LGAs (this would be expanded to all 274 wards)
INSERT INTO wards (name, lga_id, code) VALUES
-- Chanchaga LGA (Minna)
('Minna Central', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'MC01'),
('Minna North', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'MN01'),
('Minna South', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'MS01'),
('Chanchaga', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'CH01'),
('Dutsen Kura', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'DK01'),
('Gwari', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'GW01'),
('Kpakungu', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'KP01'),
('Limawa', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'LM01'),
('Maitumbi', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'MT01'),
('Shango', (SELECT id FROM lgas WHERE name = 'Chanchaga'), 'SH01'),

-- Bosso LGA
('Bosso Central', (SELECT id FROM lgas WHERE name = 'Bosso'), 'BC01'),
('Bosso East', (SELECT id FROM lgas WHERE name = 'Bosso'), 'BE01'),
('Garatu', (SELECT id FROM lgas WHERE name = 'Bosso'), 'GA01'),
('Kampala', (SELECT id FROM lgas WHERE name = 'Bosso'), 'KA01'),
('Maikunkele', (SELECT id FROM lgas WHERE name = 'Bosso'), 'MK01'),
('Shata', (SELECT id FROM lgas WHERE name = 'Bosso'), 'ST01'),

-- Suleja LGA
('Suleja A', (SELECT id FROM lgas WHERE name = 'Suleja'), 'SA01'),
('Suleja B', (SELECT id FROM lgas WHERE name = 'Suleja'), 'SB01'),
('Suleja C', (SELECT id FROM lgas WHERE name = 'Suleja'), 'SC01'),
('Hashimi A', (SELECT id FROM lgas WHERE name = 'Suleja'), 'HA01'),
('Hashimi B', (SELECT id FROM lgas WHERE name = 'Suleja'), 'HB01'),
('Kurmin Sarki', (SELECT id FROM lgas WHERE name = 'Suleja'), 'KS01'),
('Magajiya', (SELECT id FROM lgas WHERE name = 'Suleja'), 'MG01'),

-- Bida LGA
('Bida Central', (SELECT id FROM lgas WHERE name = 'Bida'), 'BDC01'),
('Bida North', (SELECT id FROM lgas WHERE name = 'Bida'), 'BDN01'),
('Bida South', (SELECT id FROM lgas WHERE name = 'Bida'), 'BDS01'),
('Kyari', (SELECT id FROM lgas WHERE name = 'Bida'), 'KY01'),
('Landzun', (SELECT id FROM lgas WHERE name = 'Bida'), 'LD01'),
('Masaba I', (SELECT id FROM lgas WHERE name = 'Bida'), 'MS01'),
('Masaba II', (SELECT id FROM lgas WHERE name = 'Bida'), 'MS02'),
('Nassarafu', (SELECT id FROM lgas WHERE name = 'Bida'), 'NS01'),
('Umaru/Majigi I', (SELECT id FROM lgas WHERE name = 'Bida'), 'UM01'),
('Umaru/Majigi II', (SELECT id FROM lgas WHERE name = 'Bida'), 'UM02'),
('Wadata', (SELECT id FROM lgas WHERE name = 'Bida'), 'WD01'),

-- Kontagora LGA
('Kontagora I', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'KT01'),
('Kontagora II', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'KT02'),
('Auna', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'AU01'),
('Gulbin Boka', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'GB01'),
('Jega', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'JG01'),
('Kampanin Bobi', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'KB01'),
('Kontorkwai', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'KK01'),
('Magami', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'MG01'),
('Ruma', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'RM01'),
('Warra', (SELECT id FROM lgas WHERE name = 'Kontagora'), 'WR01')

ON CONFLICT (name, lga_id) DO NOTHING;

-- Update hero slides with actual Niger State images
UPDATE hero_slides SET 
  image_url = '/niger-state-development-infrastructure-projects.jpg',
  title = 'Niger State Development Projects',
  subtitle = 'Tracking progress across all 274 wards for transparent governance'
WHERE display_order = 1;

UPDATE hero_slides SET 
  image_url = '/government-transparency-community-meeting.jpg',
  title = 'Transparent Governance',
  subtitle = 'Real-time updates on community development initiatives'
WHERE display_order = 2;

UPDATE hero_slides SET 
  image_url = '/community-engagement-town-hall-meeting.jpg',
  title = 'Community Engagement',
  subtitle = 'Your voice matters in development planning and execution'
WHERE display_order = 3;

UPDATE hero_slides SET 
  image_url = '/niger-state-infrastructure-development.jpg',
  title = 'Progress Monitoring',
  subtitle = 'See how projects are transforming communities across Niger State'
WHERE display_order = 4;
