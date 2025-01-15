import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

interface Session {
  user: User | null;
  loading: boolean;
}

export function useSession() {
  const [session, setSession] = useState<Session>({ user: null, loading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession({ user, loading: false });
    });

    return () => unsubscribe();
  }, []);

  return session;
}
