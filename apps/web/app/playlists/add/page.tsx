"use client";
import PlaylistForm from "@/components/PlaylistForm";

export default function Home() {
  return (
    <div className='flex flex-col gap-4 max-w-md mx-auto p-4 rounded-md'>
      <PlaylistForm />
    </div>
  );
}
