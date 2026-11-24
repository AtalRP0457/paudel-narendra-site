-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run.

-- 1. Allowlist: only these emails can edit anything.
create table if not exists public.allowlist (email text primary key);
alter table public.allowlist enable row level security;
-- No policies on purpose: nobody can read or change this table through the API.
-- Manage it here in the SQL Editor.

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_editor() to anon, authenticated;

-- 2. Content tables
create table if not exists public.profile (
  id int primary key default 1 check (id = 1),
  name_en text not null default '',
  name_ne text not null default '',
  role_en text not null default '',
  role_ne text not null default '',
  bio_en text not null default '',
  bio_ne text not null default '',
  office_en text not null default '',
  office_ne text not null default '',
  office_hours_en text not null default '',
  office_hours_ne text not null default '',
  email text not null default '',
  phone text not null default '',
  photo_url text not null default ''
);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  theme text not null default 'teal',
  font text not null default 'traditional',
  section_order text[] not null default '{research,publications,awards,teaching}',
  hidden_sections text[] not null default '{awards}'
);

create table if not exists public.research_areas (
  id bigint generated always as identity primary key,
  title_en text not null default '',
  title_ne text not null default '',
  description_en text not null default '',
  description_ne text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.publications (
  id bigint generated always as identity primary key,
  title_en text not null default '',
  title_ne text not null default '',
  authors text not null default '',
  venue text not null default '',
  year int,
  url text not null default '',
  pdf_url text not null default '',
  kind text not null default 'article',
  created_at timestamptz not null default now()
);
alter table public.publications add column if not exists kind text not null default 'article';

create table if not exists public.awards (
  id bigint generated always as identity primary key,
  title_en text not null default '',
  title_ne text not null default '',
  description_en text not null default '',
  description_ne text not null default '',
  year int,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id bigint generated always as identity primary key,
  code text not null default '',
  title_en text not null default '',
  title_ne text not null default '',
  term text not null default '',
  description_en text not null default '',
  description_ne text not null default '',
  created_at timestamptz not null default now()
);

-- 3. Row Level Security: everyone reads, only allowlisted editors write.
do $$
declare t text;
begin
  foreach t in array array['profile','settings','research_areas','publications','awards','courses']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "editors insert" on public.%I', t);
    execute format('drop policy if exists "editors update" on public.%I', t);
    execute format('drop policy if exists "editors delete" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "editors insert" on public.%I for insert to authenticated with check (public.is_editor())', t);
    execute format('create policy "editors update" on public.%I for update to authenticated using (public.is_editor()) with check (public.is_editor())', t);
    execute format('create policy "editors delete" on public.%I for delete to authenticated using (public.is_editor())', t);
  end loop;
end $$;

-- 4. File storage (photos and PDFs)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
drop policy if exists "media editors insert" on storage.objects;
drop policy if exists "media editors update" on storage.objects;
drop policy if exists "media editors delete" on storage.objects;

create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media editors insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_editor());
create policy "media editors update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_editor())
  with check (bucket_id = 'media' and public.is_editor());
create policy "media editors delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_editor());

-- 5. THE TWO PEOPLE WHO CAN LOG IN. Replace with the real Google emails.
insert into public.allowlist (email) values
  ('professor@example.com'),
  ('you@example.com')
on conflict do nothing;

-- 6. Starting content for Dr. Narendra Raj Paudel (edit or delete later from the dashboard).
-- Runs only when the tables are empty, so running this file again won't duplicate anything.
insert into public.profile (id, name_en, name_ne, role_en, role_ne, bio_en, bio_ne, office_en, office_ne, office_hours_en, office_hours_ne, email, phone, photo_url)
values (1, 'Dr. Narendra Raj Paudel', 'डा. नरेन्द्रराज पौडेल', 'Associate Professor and Head, Central Department of Public Administration, Tribhuvan University', 'सह-प्राध्यापक तथा विभागीय प्रमुख, जनप्रशासन केन्द्रीय विभाग, त्रिभुवन विश्वविद्यालय', 'I am an Associate Professor and the Head of the Central Department of Public Administration at Tribhuvan University. I teach and supervise research at the Master''s, M.Phil and PhD levels in public and development administration, and I represent Nepal on the executive of the Eastern Regional Organization for Public Administration (EROPA).

My research looks at how public policy is put into practice in Nepal: civil service management, citizens'' trust in public institutions, accountability under federalism, social inclusion, and governance after disasters. I edit the South Asian Journal of Policy and Governance, where I have been Editor-in-Chief since 2022 after serving as Managing Editor from 2013 to 2019.

Before joining the university, I spent eight years in public service with the Nepal Army and the Ministry of Defence. That experience still shapes how I teach: administration is something people do every day, not only something we study.', 'म त्रिभुवन विश्वविद्यालय, जनप्रशासन केन्द्रीय विभागमा सह-प्राध्यापक तथा विभागीय प्रमुख हुँ। म जनप्रशासन र विकास प्रशासनमा स्नातकोत्तर, एमफिल र विद्यावारिधि तहमा अध्यापन तथा अनुसन्धान निर्देशन गर्छु, र पूर्वी क्षेत्रीय जनप्रशासन संगठन (EROPA) को कार्यकारी समितिमा नेपालको प्रतिनिधित्व गर्छु।

मेरो अनुसन्धान नेपालमा सार्वजनिक नीति कसरी कार्यान्वयन हुन्छ भन्नेमा केन्द्रित छ: निजामती सेवा व्यवस्थापन, सार्वजनिक संस्थाप्रति नागरिकको विश्वास, संघीयतामा जवाफदेहिता, सामाजिक समावेशीकरण र विपत्पछिको शासन। म सन् २०२२ देखि साउथ एसियन जर्नल अफ पोलिसी एन्ड गभर्नेन्सको प्रधान सम्पादक छु, र यसअघि सन् २०१३ देखि २०१९ सम्म व्यवस्थापकीय सम्पादक थिएँ।

विश्वविद्यालयमा आउनुअघि मैले नेपाली सेना र रक्षा मन्त्रालयमा आठ वर्ष सार्वजनिक सेवा गरें। त्यो अनुभवले आज पनि मेरो अध्यापनलाई दिशा दिन्छ: प्रशासन पढ्ने विषय मात्र होइन, दैनिक गरिने काम पनि हो।', 'Central Department of Public Administration, Tribhuvan University, Balkhu, Kathmandu, Nepal', 'जनप्रशासन केन्द्रीय विभाग, त्रिभुवन विश्वविद्यालय, बल्खु, काठमाडौं, नेपाल', '', '', '', '', '/photo.jpg')
on conflict (id) do nothing;

insert into public.settings (id) values (1) on conflict (id) do nothing;

do $$ begin
if not exists (select 1 from public.research_areas) then
insert into public.research_areas (title_en, title_ne, description_en, description_ne) values
  ('Public policy implementation', 'सार्वजनिक नीति कार्यान्वयन', 'How policies move from paper to practice, with a long-running focus on reproductive health and health service delivery at the local level.', 'नीति कागजबाट व्यवहारमा कसरी पुग्छ भन्ने अध्ययन, विशेषगरी स्थानीय तहमा प्रजनन स्वास्थ्य र स्वास्थ्य सेवा प्रवाहमा।'),
  ('Civil service management', 'निजामती सेवा व्यवस्थापन', 'Human resource management, job satisfaction and administrative systems in Nepal''s civil service and across South Asia.', 'नेपाल र दक्षिण एसियाका निजामती सेवामा मानव संसाधन व्यवस्थापन, कार्य सन्तुष्टि र प्रशासनिक प्रणाली।'),
  ('Trust, accountability and democratic governance', 'विश्वास, जवाफदेहिता र लोकतान्त्रिक शासन', 'Citizens'' trust in public institutions, electoral and social accountability, corruption, and democratic responsiveness.', 'सार्वजनिक संस्थाप्रति नागरिकको विश्वास, निर्वाचन तथा सामाजिक जवाफदेहिता, भ्रष्टाचार र लोकतान्त्रिक उत्तरदायित्व।'),
  ('Federalism and local governance', 'संघीयता र स्थानीय शासन', 'Public administration under Nepal''s federal system, including provincial comparisons and decentralised service delivery.', 'नेपालको संघीय प्रणालीमा जनप्रशासन, प्रदेशगत तुलना र विकेन्द्रित सेवा प्रवाह।'),
  ('Social inclusion and gender', 'सामाजिक समावेशीकरण र लैङ्गिकता', 'Inclusive governance, women''s participation in the civil service, and gender as a resource in public management.', 'समावेशी शासन, निजामती सेवामा महिला सहभागिता, र सार्वजनिक व्यवस्थापनमा लैङ्गिकता।'),
  ('Disaster and reconstruction governance', 'विपद् तथा पुनर्निर्माण शासन', 'Governance after the 2015 earthquake, the role of security agencies in disaster management, and technology in reconstruction.', 'सन् २०१५ को भूकम्पपछिको शासन, विपद् व्यवस्थापनमा सुरक्षा निकायको भूमिका, र पुनर्निर्माणमा प्रविधि।');

end if;
if not exists (select 1 from public.publications) then
insert into public.publications (kind, title_en, title_ne, authors, venue, year) values
  ('book', 'Intersecting Realities: Social Inclusion, Youth Entrepreneurship and Geopolitics in Nepal', '', 'N. R. Paudel et al.', 'Central Department of Public Administration, Tribhuvan University', 2025),
  ('book', 'Social Accountability in the Federal Nepal: Provincial Comparison', '', 'N. R. Paudel, S. Pahari', '', 2024),
  ('book', 'Organization and Management in Nepal''s Public Bodies: A Comparative Study', 'नेपालका सार्वजनिक निकायमा संगठन र व्यवस्थापनः तुलनात्मक अध्ययन', 'N. R. Paudel, S. Pahari', 'In Nepali (2080 BS)', 2023),
  ('book', 'Public Administration and Federalism in Nepal', '', 'N. R. Paudel', 'Society of Management and Governance Policy Research Centre', 2022),
  ('book', 'Case Studies in Public Administration: A Teaching and Learning Method', 'जनप्रशासन विधामा मामिला अध्ययनः शिक्षण सिकाई विधि', 'N. R. Paudel', 'Pairavi Prakashan · In Nepali (2079 BS)', 2022),
  ('book', 'Development Management', '', 'N. R. Paudel, S. Pahari', 'Kathmandu', 2014),
  ('book', 'Public Policy Implementation: A Case Study of Reproductive Health Service Delivery at Local Level in Nepal', '', 'N. R. Paudel', 'LAP Lambert Academic Publishing, Germany', 2013),
  ('edited', 'Civil Service Management and Administrative Systems in South Asia', '', 'I. Jamil, T. N. Dhakal, N. R. Paudel (eds.)', 'Palgrave Macmillan', 2019),
  ('article', 'Effects of Peers'' Performance Nature on an Employee', '', '', 'Public Organization Review', 2025),
  ('article', 'Gender as Management Capital', '', '', 'Public Personnel Management', 2024),
  ('chapter', 'Quest for Democratic Governance in Nepal', '', '', 'Palgrave Macmillan', 2023),
  ('article', 'Disaster Management by Security Agencies in Nepal', '', '', 'Journal of APF Command and Staff College', 2023),
  ('article', 'Patient Satisfaction in a Tertiary Public Hospital in Nepal', '', '', 'BMC Health Services Research', 2021),
  ('article', 'Rethinking Civil Service Governance amid COVID-19 in Nepal: With and without Internet?', '', 'N. R. Paudel', 'Ministry of Federal Affairs and General Administration, pp. 215–225', 2021),
  ('chapter', 'Application of Artificial Intelligence in Reconstruction Governance', '', '', 'Palgrave Macmillan', 2020),
  ('conference', 'Satisfaction of Civil Servants in Nepal', '', '', 'EROPA Conference, Yogyakarta, Indonesia', 2024),
  ('conference', 'Civil Service Management in Nepal', '', '', 'EROPA Conference, Hanoi, Vietnam', 2023),
  ('conference', 'Earthquake 2015, Artificial Intelligence and Reconstruction Governance', '', '', 'Jawaharlal Nehru University, New Delhi, India', 2019),
  ('conference', 'Gender Gaps and Citizen Confidence in South Asia', '', '', '3rd Conference on Public Policy and Governance in South Asia, Kathmandu, Nepal', 2019),
  ('conference', 'Local Election in Nepal: Means of Electoral Accountability', '', '', 'IPSA Conference, Brisbane, Australia', 2018),
  ('conference', 'Does Good Governance Matter for Institutional Trust?', '', '', 'IPPA Conference, Lee Kuan Yew School of Public Policy, Singapore', 2017),
  ('conference', 'An Appraisal of Environment Management Functions in Nepal''s Municipality Area', '', '', '7th International Seminar, Kathmandu, Nepal', 2017),
  ('conference', 'Citizens'' Trust in Public Institutions after the April 25, 2015 Earthquake', '', '', 'IPSA Conference, Poznań, Poland', 2016),
  ('conference', 'Women''s Participation in Nepalese Civil Service', '', '', 'International Conference on Inclusive Governance in South Asia, Dhaka, Bangladesh', 2016),
  ('conference', 'Inclusive Governance: A Case Study of Civil Service', '', '', 'INSEARCH 2015, Comilla, Bangladesh', 2015),
  ('conference', 'Does NGOs'' Role Matter for Health Service Delivery?', '', '', 'NAPSIPAG Conference, Dhaka, Bangladesh', 2014),
  ('conference', 'Role of Government of Nepal in Mitigating Natural Disasters', '', '', 'NAPSIPAG Conference, New Delhi, India', 2013),
  ('conference', 'An Analysis of MDGs Achieved in the Health Sector', '', '', 'NAPSIPAG Conference, Dehradun, India', 2013),
  ('conference', 'Inclusive Governance in Nepal: A Case Study', '', '', 'Nepalese Management Association Conference, Kathmandu, Nepal', 2013),
  ('conference', 'Role of NGOs in Reproductive Health Policy Implementation', '', '', 'AHI Alumni Nepal Conference, Kavrepalanchowk, Nepal', 2013),
  ('conference', 'An Overview of Public Policy Teaching in Nepal', '', '', 'NASC / Niti Foundation Conference, Kathmandu, Nepal', 2013),
  ('conference', 'Anatomy of Corruption in Nepal', '', '', 'Hamdard University / NAPSIPAG Conference, Karachi, Pakistan', 2012),
  ('conference', 'Democratic Responsiveness in Nepal', '', '', 'NAPSIPAG 9th International Conference, Colombo, Sri Lanka', 2012),
  ('conference', 'Health Service Decentralization in Nepal', '', '', 'TU–University of Bergen Conference, Kathmandu, Nepal', 2011),
  ('conference', 'Bergen Summer Research School (participant)', '', '', 'University of Bergen, Norway', 2009),
  ('conference', 'Health Policy Design and Implementation in Nepal', '', '', 'TU–University of Bergen Conference, Kathmandu, Nepal', 2008),
  ('conference', 'Health Policy Implementation in Nepal', '', '', 'NAPSIPAG / JNU Conference, New Delhi, India', 2008),
  ('conference', 'Health Service Delivery: Practice and Challenge in Nepal', '', '', 'NFU / CMI Conference, Bergen, Norway', 2007),
  ('conference', 'The Role of Media in Extremist Messaging', '', '', 'IDA / SEARCCT Conference, Kuala Lumpur, Malaysia', 2007),
  ('conference', 'Nepal Communist Party (Maoist) Insurgency', '', '', 'IDA Conference, Manila, Philippines', 2007),
  ('conference', 'Critical Assessment of Local Governance', '', '', 'NAPSIPAG Annual Conference, University of Sydney, Australia', 2006),
  ('conference', 'Service Delivery in Nepal: Current Status and Challenges', '', '', 'JNU Conference, New Delhi, India', 2006),
  ('conference', 'Response of the Nepalese Government to the Maoist Insurgency', '', '', 'CATR Symposium, Goa, India', 2006),
  ('conference', 'The Cost and Risk of the Maoist Insurgency', '', '', 'ISTR Conference, Bangkok, Thailand', 2006),
  ('conference', 'The Role of NGOs to Empower Women in Nepal', '', '', 'ISTR Asia Pacific Regional Conference, Bangalore, India', 2005),
  ('conference', 'The Price of Maoist Insurgency and Political Violence', '', '', 'CATR Symposium, Jakarta, Indonesia', 2005);

end if;
if not exists (select 1 from public.courses) then
insert into public.courses (code, title_en, title_ne, term, description_en, description_ne) values
  ('MPH 503', 'Research Methodology in Public Administration', 'जनप्रशासनमा अनुसन्धान विधि', 'M.Phil', '', ''),
  ('MPH 510', 'Administrative Science and Behaviour', 'प्रशासनिक विज्ञान र व्यवहार', 'M.Phil', '', ''),
  ('MPH 611', 'Human Resource Development in Nepal', 'नेपालमा मानव संसाधन विकास', 'M.Phil', '', ''),
  ('MPH 612', 'Nepalese Civil Service', 'नेपाली निजामती सेवा', 'M.Phil', '', ''),
  ('MPA', 'Development Management I and II', 'विकास व्यवस्थापन I र II', 'MPA', '', ''),
  ('MPA', 'Research Methodology', 'अनुसन्धान विधि', 'MPA', '', ''),
  ('MPA', 'Public Policy', 'सार्वजनिक नीति', 'MPA', '', ''),
  ('MPA', 'Personnel Administration in SAARC Countries', 'सार्क मुलुकहरूमा कर्मचारी प्रशासन', 'MPA', '', '');

end if;
end $$;
