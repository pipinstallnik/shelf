"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";



interface GlobalBook {
  title: string;
  categories?: string[];
}

interface UserBook {
  id: string;
}

interface Book extends GlobalBook, UserBook {}

export function GenreRadarChart() {
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBooks = () => {
      if (!userId) return;

      const userBooksRef = collection(db, "users", userId, "myBooks");
      const unsubscribe = onSnapshot(userBooksRef, async (snapshot) => {
        const books: Book[] = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const userBookData = docSnapshot.data() as UserBook;

            // Fetch global book data
            const globalBookRef = doc(db, "books", docSnapshot.id);
            const globalBookSnapshot = await getDoc(globalBookRef);
            const globalBookData = globalBookSnapshot.exists()
              ? (globalBookSnapshot.data() as GlobalBook)
              : { title: "Unknown Title", categories: [] };

            return {
              id: docSnapshot.id,
              title: globalBookData.title,
              categories: globalBookData.categories || ["Unknown"],
            };
          })
        );
        setUserBooks(books);
      });

      return () => unsubscribe();
    };

    fetchUserBooks();
  }, [userId]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  // Process book data to count genres
  const genreCounts = userBooks.reduce((acc: Record<string, number>, book) => {
    (book.categories || []).forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {});

  // Sort genres by count and take top 6
  const topGenres = Object.entries(genreCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 6)
    .map(([genre, count]) => ({ genre, count }));

  // Prepare chart data
  const chartData = topGenres.map(({ genre, count }) => ({ genre, count }));
  console.log(chartData);
  const chartConfig = {
    count: {
      label: "# OF BOOKS",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  console.log("Chart Data", {userBooks})

  return (
    <Card className="w-[600px] h-[400px]">
      <CardHeader className="items-center ">
        <CardTitle className='font-normal'>YOUR TOP GENRES</CardTitle>

      </CardHeader>
      <CardContent className="">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-auto h-[250px] "
        > 
          <RadarChart data={chartData} width={600} height={400} >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid gridType="polygon" radialLines={true} />
            <PolarAngleAxis dataKey="genre" className='uppercase text-xs font-thin'/>
            <Radar
              className="uppercase"
              dataKey="count"
              fill="var(--color-desktop)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
