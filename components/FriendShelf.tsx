import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { BookSpine, BookSpineHeader, BookSpineTitle } from './ui/book-spine';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from './ui/button';
import { Check, LucideBookOpenCheck, LucideStar } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  authors?: string[];
  pageCount?: number;
  ownerName: string;
}

export default function FriendsShelf() {
  const [friendsBooks, setFriendsBooks] = useState<Book[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'title' | 'author' | 'owner'>('title');

  useEffect(() => {
    const fetchFriendsBooks = async () => {
      if (!userId) return;

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const friendsIds: string[] = userDoc.data().friends || [];
          if (friendsIds.length === 0) return;

          const friendsBooksPromises = friendsIds.map(async (friendId) => {
            const friendDocRef = doc(db, 'users', friendId);
            const friendDoc = await getDoc(friendDocRef);

            if (friendDoc.exists()) {
              const friendData = friendDoc.data();
              const friendBooksIds = friendData.myBooks || [];
              const friendName = friendData.firstName;

              const booksPromises = [];
              for (let i = 0; i < friendBooksIds.length; i += 10) {
                const batch = friendBooksIds.slice(i, i + 10);
                const booksRef = collection(db, 'books');
                const booksQuery = query(booksRef, where('__name__', 'in', batch));
                booksPromises.push(getDocs(booksQuery));
              }

              const booksSnapshots = await Promise.all(booksPromises);
              return booksSnapshots.flatMap(snapshot => 
                snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                  ownerName: friendName,
                }))
              ) as Book[];
            }
            return [];
          });

          const friendsBooksArrays = await Promise.all(friendsBooksPromises);
          const allFriendsBooks = friendsBooksArrays.flat();
          setFriendsBooks(allFriendsBooks);
        }
      } catch (error) {
        console.error('Error fetching friends books:', error);
      }
    };

    fetchFriendsBooks();
  }, [userId]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });

    return () => unsubscribe();
  }, []);

  const sortedBooks = [...friendsBooks].sort((a, b) => {
    if (sortOption === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortOption === 'author') {
      const authorA = a.authors?.[0] || '';
      const authorB = b.authors?.[0] || '';
      return authorA.localeCompare(authorB);
    } else if (sortOption === 'owner') {
      return a.ownerName.localeCompare(b.ownerName);
    }
    return 0;
  });

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Friends' Book Collections</h2>
      <div className="mb-4">
        <label htmlFor="sort" className="mr-2">Sort by:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as 'title' | 'author' | 'owner')}
          className="p-1 border rounded"
        >
          <option value="title">Title (A-Z)</option>
          <option value="author">Author (A-Z)</option>
          <option value="owner">Owner (A-Z)</option>
        </select>
      </div>
      <AnimatePresence>
        {sortedBooks.length > 0 ? (
          sortedBooks.map((book) => (
            <Dialog key={book.id}>
              <DialogTrigger asChild>
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ x: -10 }}
                  whileTap={{ scale: 0.97 }}
                  className='p-0 cursor-pointer'
                >
                  <BookSpine className='p-2'>
                    <BookSpineHeader className='flex justify-between items-center h-10'>
                      <div className='text-xs max-w-[80px] line-clamp-2'>
                        {book.authors && <div>{book.authors.join(', ')}</div>}
                      </div>
                      <BookSpineTitle className='text-sm'>{book.title}</BookSpineTitle>
                      <div className='text-xs'>Owned by {book.ownerName}</div>
                    </BookSpineHeader>
                  </BookSpine>
                </motion.div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <div className='flex justify-between'>
                      <div>{book.title}</div>
                    </div>
                    {book.authors && <p>By {book.authors.join(', ')}</p>}
                    <p className='text-sm'>{book.pageCount} pages</p>
                    <p className='text-sm'>Owned by {book.ownerName}</p>
                  </DialogTitle>
                  <DialogDescription>
                    <p className='line-clamp-3'>A description of the book could go here.</p>
                  </DialogDescription>
                </DialogHeader>
                <Button variant='default' className='w-full mt-4'>
                  Add to Collection
                </Button>
                <Button variant='default' className='w-full mt-2'>
                  Mark as Read
                </Button>
                <Button variant='default' className='w-full mt-2'>
                  Want to Read
                </Button>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <p>No books found in friends' collections.</p>
        )}
      </AnimatePresence>
    </div>
  );
}

export { FriendsShelf };
