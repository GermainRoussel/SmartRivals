"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Dice5, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/actions/profile";
import type { Profile } from "@/lib/auth";

const STYLES = ["avataaars", "bottts", "fun-emoji", "thumbs", "adventurer", "big-smile"];

function dicebear(style: string, seed: string) {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed || "SmartRivals")}`;
}

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [seed, setSeed] = useState(profile.username || "SmartRivals");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = avatarUrl || dicebear("avataaars", seed);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choisissez une image.");
    if (file.size > 3 * 1024 * 1024) return setError("Image trop lourde (max 3 Mo).");
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await updateProfile({ username, bio: bio || null, avatar_url: avatarUrl });
    if ("error" in res) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/profile");
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto mt-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
      <h2 className="font-display text-3xl font-bold text-slate-800 mb-8 text-center">
        Modifier le profil
      </h2>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={preview}
          alt="Avatar"
          className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg mb-4 object-cover"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="mr-1" />}
            Importer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSeed(Math.random().toString(36).slice(2));
              setAvatarUrl(null);
            }}
          >
            <Dice5 size={16} className="mr-1" /> Aléatoire
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
      </div>

      {/* DiceBear styles */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Styles d&apos;avatar
        </span>
        <div className="grid grid-cols-6 gap-2">
          {STYLES.map((style) => {
            const url = dicebear(style, seed);
            const active = avatarUrl === url;
            return (
              <button
                key={style}
                onClick={() => setAvatarUrl(url)}
                className={`relative aspect-square rounded-2xl border-2 p-1 transition-all ${
                  active ? "border-primary ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <img src={url} alt={style} className="w-full h-full" />
                {active && (
                  <Check size={14} className="absolute top-1 right-1 text-white bg-primary rounded-full p-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Username */}
      <label className="block font-bold text-slate-700 mb-1">Pseudo</label>
      <input
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (!avatarUrl) setSeed(e.target.value || "SmartRivals");
        }}
        maxLength={24}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-5"
      />

      {/* Bio */}
      <label className="block font-bold text-slate-700 mb-1">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={200}
        rows={3}
        placeholder="Quelques mots sur vous…"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
      />
      <div className="text-right text-xs text-slate-400 mb-6">{bio.length}/200</div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 font-bold px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={() => router.push("/profile")} disabled={saving}>
          Annuler
        </Button>
        <Button fullWidth size="lg" onClick={save} disabled={saving || username.trim().length < 2}>
          {saving ? <Loader2 className="animate-spin" /> : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
