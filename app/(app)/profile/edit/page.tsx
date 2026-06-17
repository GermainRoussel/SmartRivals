import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export default async function ProfileEditPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return <ProfileEditor profile={profile} />;
}
