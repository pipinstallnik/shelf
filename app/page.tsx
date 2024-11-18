'use client'

import Image from "next/image";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Next.js 13+ navigation
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Shelf from "@/components/shelf";
import BookSearch from "@/components/bookSearch";
import { GenreRadarChart } from "@/components/GenreRadarChart";

import FriendsShelf from "@/components/FriendShelf";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import Friends from "@/components/friends";
import { LucidePlus } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [auth, router]);

  return (
    <div>
      {/* Desktop setup */}
      <div className="hidden sm:block">
        <div className="w-screen h-screen flex flex-row p-4 gap-2 justify-between">
          <div className="place-items-center w-2/3">
            <BookSearch />
          </div>
          <div className="flex flex-col p-2">
            <GenreRadarChart />
            <Shelf />
            <Friends />
          </div>
        </div>
      </div>

      {/* Mobile setup */}
      <div className="block sm:hidden relative">
        <div className="w-screen h-screen">
          <Shelf />
        </div>
        <button
          className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-10"
          onClick={() => console.log("Overlay button clicked!")}
        >
          <LucidePlus />
        </button>
      </div>
    </div>
  );
}
