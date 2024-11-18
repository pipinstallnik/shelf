import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
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
import { Input } from './ui/input';
import { Button } from './ui/button';
import StarRating from './ui/star-rating';
import { Timestamp } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { Textarea } from "@/components/ui/textarea"





interface GlobalBook {
    title: string;
    authors?: string[];
    pageCount?: number;
    categories?: string[];
  }
  
  interface UserBook {
    id: string;
    dateAdded?: Timestamp | Date; // Allow both Timestamp and Date
    rating: number | null; // Allow `null` as a possible value
    reviewText?: string;
  }
  
  interface Book extends GlobalBook, UserBook {}
  
  export default function Shelf() {
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<'title' | 'author'>('title');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [reviewText, setReviewText] = useState<string>('');
    const [rating, setRating] = useState<number | null>(null); // Allow `null`
  
    useEffect(() => {
      const fetchUserBooks = () => {
        if (!userId) return;
  
        const userBooksRef = collection(db, 'users', userId, 'myBooks');
        const unsubscribe = onSnapshot(userBooksRef, async (snapshot) => {
          const books: Book[] = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
              const userBookData = docSnapshot.data() as UserBook;
  
              // Fetch global book data
              const globalBookRef = doc(db, 'books', docSnapshot.id);
              const globalBookSnapshot = await getDoc(globalBookRef);
              const globalBookData = globalBookSnapshot.exists()
                ? globalBookSnapshot.data() as GlobalBook
                : { title: 'Unknown Title', authors: [], pageCount: 0, categories: [] };
  
                return {
                  id: docSnapshot.id,
                  title: globalBookData.title,
                  authors: globalBookData.authors || [],
                  pageCount: globalBookData.pageCount || 0,
                  categories: globalBookData.categories || ['Unknown Category'],
                  dateAdded: userBookData.dateAdded
                    ? userBookData.dateAdded instanceof Timestamp
                      ? userBookData.dateAdded.toDate() // Convert Timestamp to Date
                      : userBookData.dateAdded // Already a Date
                    : undefined,
                  rating: userBookData.rating || null,
                  reviewText: userBookData.reviewText || '',
                };
                
            })
          );
          setUserBooks(books); // No type mismatch here now
        });
  
        return () => unsubscribe();
      };
  
      fetchUserBooks();
    }, [userId]);
  
    useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null);
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    const handleRemoveBook = async (bookId: string) => {
      if (!userId) return;
  
      const bookRef = doc(db, 'users', userId, 'myBooks', bookId);
      try {
        await deleteDoc(bookRef);
        alert('Book removed from your collection!');
      } catch (error) {
        console.error('Error removing book:', error);
        alert('Failed to remove book.');
      }
    };
  
    const handleSaveReview = async (bookId: string) => {
      if (!userId) return;
    
      const bookRef = doc(db, 'users', userId, 'myBooks', bookId);
    
      // Build the update data object conditionally
      const updateData: Partial<UserBook> = {
         // Always include reviewText
      };
    
      if (rating !== null) {
        updateData.rating = rating; // Only include rating if it's not null
      }

      if (reviewText !== null) {
        updateData.reviewText = reviewText;
      }
    
      try {
        await updateDoc(bookRef, updateData);
        alert('Review saved successfully!');
      } catch (error) {
        console.error('Error saving review:', error);
        alert('Failed to save review.');
      }
    };
    
  
    const sortedBooks = [...userBooks].sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'author') {
        const authorA = a.authors?.[0] || '';
        const authorB = b.authors?.[0] || '';
        return authorA.localeCompare(authorB);
      }
      return 0;
    });
  
    return (
      <div className='p-4'>
        <h2 className='text-xl font-bold mb-4 uppercase'>Your Book Collection</h2>
        <div className="mb-4">
          <label htmlFor="sort" className="mr-2 uppercase">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'title' | 'author')}
            className="p-1 border rounded uppercase"
          >
            <option value="title">Title (A-Z)</option>
            <option value="author">Author (A-Z)</option>
          </select>
        </div>
        <AnimatePresence>
          {sortedBooks.map((book) => (
            <Dialog key={book.id} open={selectedBook?.id === book.id} onOpenChange={(isOpen) => {
              if (isOpen) {
                setSelectedBook(book);
                setReviewText(book.reviewText || '');
                setRating(book.rating || null);
              } else {
                setSelectedBook(null);
              }
            }}>
              <DialogTrigger asChild>
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ x: -10 }}
                  whileTap={{ scale: 0.97 }}
                  className="cursor-pointer"
                >
                  <BookSpine className=''>
                    <BookSpineHeader>
                      <div className='w-[100px]'>
                      <h2 className=' text-sm text-wrap line-clamp-1'>{book.authors}</h2>
                      </div>
                      <BookSpineTitle className='text-ellipsis'>{book.title}</BookSpineTitle>
                      
                    </BookSpineHeader>
                  </BookSpine>
                </motion.div>
              </DialogTrigger>
              <DialogContent >
                <DialogHeader>
                  <DialogTitle>{book.title}</DialogTitle>
                  <DialogDescription className='uppercase'>
                    <h2 className=''>{book.authors?.join(', ')}</h2>
                    <h2>{book.pageCount} PAGES</h2>
                    <h2>Category: {book.categories?.[0]}</h2>
                    <h2>
                      Date Added: 
                      {book.dateAdded
                        ? book.dateAdded instanceof Timestamp
                          ? book.dateAdded.toDate().toLocaleDateString() // Convert Timestamp to Date
                          : book.dateAdded.toLocaleDateString() // Already a Date
                        : 'Unknown'}
                    </h2>


                    </DialogDescription>
                
                <div>
                  <label className='block mt-2'>RATING</label>
                  <StarRating
                    rating={rating} setRating={setRating}
                  />
                  <label className='block mt-2'>REVIEW</label>
                  <Textarea
                    className='max-h-[90px]'
                    placeholder="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <Button className='mt-4' onClick={() => handleSaveReview(book.id)}>
                    Save Review
                  </Button>
                  <Button className='mt-2' variant="destructive" onClick={() => handleRemoveBook(book.id)}>
                    Remove from Collection
                  </Button>
                </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </AnimatePresence>
      </div>
    );
  }
  