-- Create a stored procedure for secure Patient Login
create or replace function login_patient(p_name text, p_pin text)
returns json
language plpgsql
security definer -- Runs with permissions of the creator (trusted)
as $$
declare
  found_patient "Patient"%rowtype;
begin
  -- Case-insensitive name match, Exact PIN match
  -- Select into variable
  select *
  into found_patient
  from "Patient"
  where lower(name) = lower(p_name)
  and pin = p_pin
  limit 1;

  -- Return null if not found
  if found_patient.id is null then
    return json_build_object('error', 'Invalid credentials');
  end if;

  -- Return safe data
  return json_build_object(
    'patientId', found_patient.id,
    'name', found_patient.name,
    'photoUrl', found_patient."photoUrl"
  );
end;
$$;
