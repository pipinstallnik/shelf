// components/login-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "@/lib/firebase"; // Import the auth instance
import { Button } from "@/components/ui/button";
import {
  BookFace,
  BookFaceContent,
  BookFaceDescription,
  BookFaceHeader,
  BookFaceTitle,
} from "@/components/ui/book-face";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideLock, LucideLogIn } from "lucide-react";


export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Optional: Add state for loading and error handling
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Reset error state

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect or update UI on successful login
      router.push("/"); // Replace with your dashboard route
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      // Redirect or update UI on successful login
      await auth.currentUser?.getIdToken(true);
      router.push("/"); // Replace with your dashboard route
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <BookFace className="w-[500px] h-[700px]">
      <BookFaceHeader>
        <BookFaceTitle className="text-center text-6xl">SHELF</BookFaceTitle>
        
      </BookFaceHeader>
      <BookFaceContent>
        <form onSubmit={handleEmailLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">EMAIL</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">PASSWORD</Label>
                
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" variant='outline' className="w-full">
              <LucideLogIn className="inline" />LOGIN
            </Button>
            <Link href="#" className="text-center  text-sm underline">
                  FORGOT YOUR PASSWORD?
                </Link>
            <p className='text-center'>OR</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
            LOGIN WITH GOOGLE
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-sm">
          DON&apos;T HAVE AN ACCOUNT?{" "}
          <Link href="/signup" className="underline">
            SIGN UP
          </Link>
        </div>
      </BookFaceContent>
    </BookFace>
  );
}
