-- Seed Niger State LGAs, Wards, and Polling Units

-- Insert Niger State LGAs
INSERT INTO lgas (name) VALUES
('Agaie'),
('Agwara'),
('Bida'),
('Borgu'),
('Bosso'),
('Chanchaga'),
('Edati'),
('Gbako'),
('Gurara'),
('Katcha'),
('Kontagora'),
('Lapai'),
('Lavun'),
('Magama'),
('Mariga'),
('Mashegu'),
('Mokwa'),
('Munya'),
('Paikoro'),
('Rafi'),
('Rijau'),
('Shiroro'),
('Suleja'),
('Tafa'),
('Wushishi')
ON CONFLICT (name) DO NOTHING;

-- Sample Wards for major LGAs (this would be expanded with real data)
-- Bida LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bida I'),
    ('Bida II'),
    ('Bida III'),
    ('Dokodza'),
    ('Kyari'),
    ('Landzun'),
    ('Masaba I'),
    ('Masaba II'),
    ('Nassarafu'),
    ('Umaru/Majigi'),
    ('Wadata')
) AS w(ward_name) WHERE l.name = 'Bida'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Suleja LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bagama'),
    ('Chanchaga'),
    ('Diko'),
    ('Hashimi'),
    ('Iku'),
    ('Kwamba'),
    ('Magajiya'),
    ('Maje'),
    ('Suleja'),
    ('Wambai')
) AS w(ward_name) WHERE l.name = 'Suleja'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Add sample wards for remaining LGAs
-- Agaie LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Agaie Central'),
    ('Baro'),
    ('Ekossa'),
    ('Etsu Agaie'),
    ('Magaji'),
    ('Sabon Gida'),
    ('Soba'),
    ('Tsuntsu'),
    ('Wobe'),
    ('Zango')
) AS w(ward_name) WHERE l.name = 'Agaie'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Agwara LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Agwara Central'),
    ('Boku'),
    ('Gallah'),
    ('Gonagi'),
    ('Kakihum'),
    ('Kutigi I'),
    ('Kutigi II'),
    ('Maburya'),
    ('Rofia'),
    ('Tukumbi')
) AS w(ward_name) WHERE l.name = 'Agwara'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Borgu LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Babanna'),
    ('Borgu Central'),
    ('Ilesha Gogo'),
    ('New Bussa I'),
    ('New Bussa II'),
    ('Sanbai'),
    ('Shagunu'),
    ('Wawa I'),
    ('Wawa II'),
    ('Yemigi')
) AS w(ward_name) WHERE l.name = 'Borgu'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Bosso LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bosso Central'),
    ('Chanchaga'),
    ('Garatu'),
    ('Kampala'),
    ('Kodo'),
    ('Maikunkele'),
    ('Maitumbi'),
    ('Shata'),
    ('Tudun Fulani'),
    ('Wushishi')
) AS w(ward_name) WHERE l.name = 'Bosso'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Edati LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Edati Central'),
    ('Enagi'),
    ('Gbakogi'),
    ('Gogata'),
    ('Lemu'),
    ('Pali'),
    ('Sarkin Pawa'),
    ('Ujiji'),
    ('Unguwar Rimi'),
    ('Zazzaga')
) AS w(ward_name) WHERE l.name = 'Edati'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Gbako LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bida'),
    ('Gbako Central'),
    ('Katcha'),
    ('Kusotachi'),
    ('Lemu'),
    ('Mallam Madori'),
    ('Sidi Saad'),
    ('Tungan Ibrahim'),
    ('Tungan Maliki'),
    ('Yamadaddi')
) AS w(ward_name) WHERE l.name = 'Gbako'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Gurara LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Gurara Central'),
    ('Gawu Babangida'),
    ('Gawu Sabo'),
    ('Kabo'),
    ('Kwakuti'),
    ('Pina'),
    ('Saura'),
    ('Tunga'),
    ('Uke'),
    ('Yelwa')
) AS w(ward_name) WHERE l.name = 'Gurara'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Katcha LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Batati'),
    ('Gumi'),
    ('Katcha Central'),
    ('Kurmin Sarki'),
    ('Kwakuti'),
    ('Sarcena'),
    ('Tegina'),
    ('Tudun Wada'),
    ('Yamma'),
    ('Zangon')
) AS w(ward_name) WHERE l.name = 'Katcha'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Kontagora LGA Wards
INSERT INTO wards (lga_id, name)
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bangajiya'),
    ('Kontagora Central'),
    ('Madara'),
    ('Masuga'),
    ('Rafin Gabas'),
    ('Tungan Kawo'),
    ('Tungan Maliki'),
    ('Usalle'),
    ('Yamma'),
    ('Zangon')
) AS w(ward_name) WHERE l.name = 'Kontagora'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Lapai LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Arewa'),
    ('Central'),
    ('Gulu'),
    ('Kudu'),
    ('Lapai Central'),
    ('Muye'),
    ('Shaba'),
    ('Takuti'),
    ('Tasha'),
    ('Yarmalamai')
) AS w(ward_name) WHERE l.name = 'Lapai'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Lavun LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Batati'),
    ('Doko'),
    ('Dukku'),
    ('Gaba'),
    ('Gaba North'),
    ('Gaba South'),
    ('Jima'),
    ('Kusotachi'),
    ('Lavun Central'),
    ('Tungan Kawo')
) AS w(ward_name) WHERE l.name = 'Lavun'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Magama LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Auna Central'),
    ('Bangi'),
    ('Bosso'),
    ('Ibeto'),
    ('Ibbi'),
    ('Magama Central'),
    ('Nassarawa'),
    ('Ndayako'),
    ('Shaku'),
    ('Tudun Wada')
) AS w(ward_name) WHERE l.name = 'Magama'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Mariga LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bangajiya'),
    ('Bosso'),
    ('Dandaudu'),
    ('Ibeto'),
    ('Inkwai'),
    ('Kataregi'),
    ('Mariga Central'),
    ('Sarkin Pawa'),
    ('Tudun Wada'),
    ('Uku')
) AS w(ward_name) WHERE l.name = 'Mariga'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Mashegu LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Dapangi'),
    ('Ibeto'),
    ('Kabo'),
    ('Kakangi'),
    ('Kudu'),
    ('Mashegu Central'),
    ('Sarkin Pawa'),
    ('Tudun Wada'),
    ('Wushishi'),
    ('Yalwa')
) AS w(ward_name) WHERE l.name = 'Mashegu'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Mokwa LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Bosso'),
    ('Gbafun'),
    ('Jebba'),
    ('Kudu'),
    ('Labozhi'),
    ('Mokwa Central'),
    ('Muregi'),
    ('Rabba'),
    ('Sarkin Pawa'),
    ('Tudun Wada')
) AS w(ward_name) WHERE l.name = 'Mokwa'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Munya LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Dandaudu'),
    ('Dukku'),
    ('Ibeto'),
    ('Kakangi'),
    ('Munya Central'),
    ('Sabo'),
    ('Sarkin Pawa'),
    ('Tudun Wada'),
    ('Uku'),
    ('Zungeru')
) AS w(ward_name) WHERE l.name = 'Munya'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Paikoro LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Adunu'),
    ('Gawu'),
    ('Gulu'),
    ('Kudu'),
    ('Paikoro Central'),
    ('Rafin Gabas'),
    ('Sarkin Pawa'),
    ('Tudun Wada'),
    ('Umaru Majigi'),
    ('Yarmalamai')
) AS w(ward_name) WHERE l.name = 'Paikoro'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Rafi LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Gulbin Boka'),
    ('Gulbin Kuka'),
    ('Kagara'),
    ('Kusheriki'),
    ('Rafi Central'),
    ('Sabo'),
    ('Sarkin Pawa'),
    ('Tudun Wada'),
    ('Wuse'),
    ('Zangon')
) AS w(ward_name) WHERE l.name = 'Rafi'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Rijau LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Dugga'),
    ('Gawu'),
    ('Kusa'),
    ('Rijau Central'),
    ('Sarkin Pawa'),
    ('Shambo'),
    ('Tudun Wada'),
    ('Umaru Majigi'),
    ('Wushishi'),
    ('Zungeru')
) AS w(ward_name) WHERE l.name = 'Rijau'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Shiroro LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Allawa'),
    ('Bangi'),
    ('Gulbin Boka'),
    ('Kuta'),
    ('Manta'),
    ('Pina'),
    ('Sabo'),
    ('Shiroro Central'),
    ('Tudun Wada'),
    ('Uku')
) AS w(ward_name) WHERE l.name = 'Shiroro'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Tafa LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Dogon Kurmi'),
    ('Garam'),
    ('Iku'),
    ('New Bussa'),
    ('Sabo'),
    ('Sarkin Pawa'),
    ('Tafa Central'),
    ('Tudun Wada'),
    ('Wuse'),
    ('Zungeru')
) AS w(ward_name) WHERE l.name = 'Tafa'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Wushishi LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Chanchaga'),
    ('Kusheriki'),
    ('Sabon Gari'),
    ('Sarkin Pawa'),
    ('Tudun Wada'),
    ('Umaru Majigi'),
    ('Wushishi Central'),
    ('Yalwa'),
    ('Zungeru'),
    ('Zunzu')
) AS w(ward_name) WHERE l.name = 'Wushishi'
ON CONFLICT (lga_id, name) DO NOTHING;-- Minna (Chanchaga) LGA Wards
INSERT INTO wards (lga_id, name) 
SELECT l.id, ward_name FROM lgas l, (VALUES
    ('Barkin Sale'),
    ('Bosso'),
    ('Chanchaga'),
    ('Dutsen Kura'),
    ('Gidan Kwano'),
    ('Kpakungu'),
    ('Limawa'),
    ('Maitumbi'),
    ('Minna Centre'),
    ('Nasarawa'),
    ('Sauka Kahuta')
) AS w(ward_name) WHERE l.name = 'Chanchaga'
ON CONFLICT (lga_id, name) DO NOTHING;

-- Sample Polling Units for Bida I Ward
INSERT INTO polling_units (ward_id, name, code)
SELECT w.id, pu_name, pu_code FROM wards w, (VALUES
    ('Bida Central Primary School I', 'BD001'),
    ('Bida Central Primary School II', 'BD002'),
    ('Emir Palace Square', 'BD003'),
    ('Kyari Market Square', 'BD004'),
    ('Umaru Sanda Ndayako Square', 'BD005')
) AS pu(pu_name, pu_code) 
WHERE w.name = 'Bida I'
ON CONFLICT (ward_id, name) DO NOTHING;
