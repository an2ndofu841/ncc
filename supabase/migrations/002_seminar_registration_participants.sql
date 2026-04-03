-- Increment seminar.current_participants when a member registers (RLS blocks direct updates by members)
CREATE OR REPLACE FUNCTION public.increment_seminar_participants_on_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.seminars
  SET current_participants = current_participants + 1
  WHERE id = NEW.seminar_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seminar_registration_increment_participants ON public.seminar_registrations;
CREATE TRIGGER trg_seminar_registration_increment_participants
  AFTER INSERT ON public.seminar_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_seminar_participants_on_registration();
