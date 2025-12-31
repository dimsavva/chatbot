import { Chat } from "@/components/chat/chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <main className="container mx-auto">
        <Chat />
      </main>
    </div>
  );
}
