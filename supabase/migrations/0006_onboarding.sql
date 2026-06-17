-- SmartRivals — onboarding flag: send brand-new accounts to profile setup once.

alter table public.profiles add column if not exists onboarded boolean not null default false;

-- Existing accounts are considered already onboarded (don't nag them).
update public.profiles set onboarded = true where onboarded = false;
