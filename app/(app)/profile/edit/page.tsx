import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const { welcome } = await searchParams;
  return <ProfileEditor profile={profile} welcome={welcome === "1"} />;
}
