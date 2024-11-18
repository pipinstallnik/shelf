import React, { useState, useEffect } from 'react';
import { collection, doc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
}

interface UserDocument {
  friends: string[]; // Array of friend document IDs
}

export default function Friends() {
  const [userFriends, setUserFriends] = useState<Friend[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) return;

      try {
        // Step 1: Fetch the current user's document
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserDocument;
          const friendIds: string[] = userData?.friends || [];

          if (friendIds.length > 0) {
            // Step 2: Fetch friends' details from the 'users' collection
            const friendsQuery = query(collection(db, 'users'), where('__name__', 'in', friendIds));
            const friendsSnapshot = await getDocs(friendsQuery);

            const friendsList: Friend[] = friendsSnapshot.docs.map((doc) => ({
              id: doc.id,
              firstName: doc.data().firstName,
              lastName: doc.data().lastName,
            }));

            setUserFriends(friendsList);
          } else {
            setUserFriends([]);
          }
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
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

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Your Friends</h2>
      {userFriends.length > 0 ? (
        <ul className='space-y-2'>
          {userFriends.map((friend) => (
            <li key={friend.id} className='p-2 border rounded'>
              <div className='font-semibold'>{friend.firstName} {friend.lastName}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No friends found.</p>
      )}
    </div>
  );
}
