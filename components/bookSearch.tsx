import React, { useState, FormEvent, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { BookFace, BookFaceDescription, BookFaceTitle } from './ui/book-face';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate: string;
    categories?: string[];
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
    };
    description: string;
  };
  isInCollection?: boolean;
  dateAdded?: string;
}

const BookSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userBooks, setUserBooks] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserBooks = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userBooksRef = collection(db, 'users', user.uid, 'myBooks');
        const snapshot = await getDocs(userBooksRef);
        const bookIds = snapshot.docs.map((doc) => doc.id);
        setUserBooks(bookIds);
      }
    };

    fetchUserBooks();
  }, []);

  useEffect(() => {
    // Update `isInCollection` status dynamically
    setBooks((prevBooks) =>
      prevBooks.map((book) => ({
        ...book,
        isInCollection: userBooks.includes(book.id),
      }))
    );
  }, [userBooks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setBooks([]);

    try {
      const res = await fetch(
        `/api/GoogleBooksAPI?query=${encodeURIComponent(searchTerm)}`
      );
      const data = await res.json();
      const booksData = data.items || [];

      const updatedBooks = booksData.map((book: Book) => ({
        ...book,
        isInCollection: userBooks.includes(book.id),
      }));

      setBooks(updatedBooks);
    } catch (error) {
      console.error('Error fetching books:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBook = async (book: Book, action: 'addToCollection' | 'removeFromCollection') => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Please sign in to save books.');
      return;
    }

    const userId = user.uid;
    const bookId = book.id;

    // References for user's subcollection and global books collection
    const userBooksRef = doc(db, 'users', userId, 'myBooks', bookId);
    const globalBookRef = doc(db, 'books', bookId);

    try {
      if (action === 'addToCollection') {
        // Save static info to the global `books` collection
        const bookDoc = await getDoc(globalBookRef);
        if (!bookDoc.exists()) {
          await setDoc(globalBookRef, {
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors || [],
            pageCount: book.volumeInfo.pageCount || 0,
            publishedDate: book.volumeInfo.publishedDate,
            description: book.volumeInfo.description,
            publisher: book.volumeInfo.publisher,
            categories: book.volumeInfo.categories || [],
            imageLinks: book.volumeInfo.imageLinks || {},
          });
        }

        // Save user-specific info to the `myBooks` subcollection
        await setDoc(userBooksRef, {
          dateAdded: Timestamp.now(),
        });

        setUserBooks((prev) => [...prev, bookId]);
      } else if (action === 'removeFromCollection') {
        // Remove from the user's `myBooks` subcollection
        await deleteDoc(userBooksRef);
        setUserBooks((prev) => prev.filter((id) => id !== bookId));
        alert('Book removed from your collection!');
      }
    } catch (error) {
      console.error('Error updating book collection:', error instanceof Error ? error.message : String(error));
      alert('Failed to update your book collection.');
    }
  };

  return (
    <div className='w-full h-[300px]'>
      <h2 className='text-6xl'>SEARCH FOR BOOKS</h2>
      <form className='p-2 flex flex-col gap-2' onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="SEARCH BY TITLE OR AUTHOR"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='ghost' type="submit" className='w-full p-5'>Search</Button>
      </form>

      {isLoading && <p>Loading...</p>}

      <div className='flex flex-row gap-y-5 gap-x-0 max-w-[1000px] flex-wrap items-end place-content-center justify-between'>
        {books.map((book) => (
          <motion.div
            whileHover={{
              x: 0,
              y: 2,
              scale: 1.02,
            }}
            key={book.id}
          >
            <BookFace className='p-5 gap-x-0 h-[350px] w-[250px]'>
              <BookFaceTitle className='truncate'>
                {book.volumeInfo.title}
              </BookFaceTitle>
              <BookFaceDescription className='truncate'>
                By {book.volumeInfo.authors?.join(', ')}
              </BookFaceDescription>
              <Button
                variant='default'
                className='w-full'
                onClick={() =>
                  toggleBook(
                    book,
                    book.isInCollection ? 'removeFromCollection' : 'addToCollection'
                  )
                }
              >
                {book.isInCollection
                  ? 'REMOVE FROM COLLECTION'
                  : 'ADD TO COLLECTION'}
              </Button>
            </BookFace>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BookSearch;
