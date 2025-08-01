import { db, storage } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Item Types
export async function getItemTypes() {
  const itemTypesCollection = collection(db, "itemTypes");
  const snapshot = await getDocs(itemTypesCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getItemType(id) {
  const docRef = doc(db, "itemTypes", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } else {
    return null;
  }
}

export async function createItemType(data) {
  return await addDoc(collection(db, "itemTypes"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItemType(id, data) {
  const docRef = doc(db, "itemTypes", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItemType(id) {
  const docRef = doc(db, "itemTypes", id);
  await deleteDoc(docRef);
}

// Items
export async function getItems(userId) {
  const itemsQuery = query(
    collection(db, "items"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(itemsQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getItem(id) {
  const docRef = doc(db, "items", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } else {
    return null;
  }
}

export async function createItem(data) {
  return await addDoc(collection(db, "items"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItem(id, data) {
  const docRef = doc(db, "items", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(id) {
  const docRef = doc(db, "items", id);
  await deleteDoc(docRef);
}

// Log Entries
export async function getLogEntries(itemId) {
  const logEntriesQuery = query(
    collection(db, "logEntries"),
    where("itemId", "==", itemId),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(logEntriesQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createLogEntry(data) {
  return await addDoc(collection(db, "logEntries"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Reminders
export async function getItemReminders(itemId) {
  const remindersQuery = query(
    collection(db, "reminders"),
    where("itemId", "==", itemId),
    orderBy("nextDate", "asc")
  );

  const snapshot = await getDocs(remindersQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createReminder(data) {
  return await addDoc(collection(db, "reminders"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Image Upload
export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    url,
    path,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}
