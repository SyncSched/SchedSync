import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, getCountFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgNQNKqcnUXKQP2M21uApMvrMnCj-q-hk",
  authDomain: "schedsync-2d281.firebaseapp.com",
  projectId: "schedsync-2d281",
  storageBucket: "schedsync-2d281.firebasestorage.app",
  messagingSenderId: "465282284981",
  appId: "1:465282284981:web:1000ec5028434d830aedfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to check if email exists in a collection
async function checkEmailExists(email: string, collectionName: string): Promise<boolean> {
  const q = query(collection(db, collectionName), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Function to add contact form submission
export async function submitContactForm(data: { name: string; email: string; message: string }) {
  try {
    // Check if email already exists
    const emailExists = await checkEmailExists(data.email, "contactSubmissions");
    if (emailExists) {
      return {
        success: false,
        error: "This email has already submitted a contact form. Please wait for our response."
      };
    }

    const docRef = await addDoc(collection(db, "contactSubmissions"), {
      ...data,
      timestamp: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error submitting contact form: ", error);
    return { success: false, error };
  }
}

// Function to add waitlist submission
export async function submitWaitlist(email: string) {
  try {
    // Check if email already exists in waitlist
    const emailExists = await checkEmailExists(email, "waitlist");
    if (emailExists) {
      return {
        success: false,
        error: "This email is already on our waitlist!"
      };
    }

    const docRef = await addDoc(collection(db, "waitlist"), {
      email,
      timestamp: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error submitting to waitlist: ", error);
    return { success: false, error };
  }
}

// Function to get waitlist count
export async function getWaitlistCount() {
  try {
    const coll = collection(db, "waitlist");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting waitlist count: ", error);
    return 0;
  }
}