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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { resizeImage } from "./utils";

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

// Helper function to delete an image from Firebase Storage
async function deleteImageFromStorage(imagePath, thumbnailPath) {
  try {
    if (imagePath) {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    }

    if (thumbnailPath) {
      const thumbnailRef = ref(storage, thumbnailPath);
      await deleteObject(thumbnailRef);
    }
  } catch (error) {
    console.error("Error deleting image from storage:", error);
    // Continue with deletion even if image deletion fails
  }
}

// Helper function to delete all images associated with an item
async function deleteItemImages(item) {
  if (item.images && Array.isArray(item.images)) {
    const deletePromises = item.images.map((image) =>
      deleteImageFromStorage(image.path, image.thumbnailPath)
    );
    await Promise.all(deletePromises);
  }
}

export async function deleteItemType(id) {
  // First, get all items of this type
  const itemsQuery = query(collection(db, "items"), where("typeId", "==", id));

  const itemsSnapshot = await getDocs(itemsQuery);

  // Delete each item and its associated images
  const deletePromises = itemsSnapshot.docs.map(async (itemDoc) => {
    const item = { id: itemDoc.id, ...itemDoc.data() };
    // Delete all images associated with this item
    await deleteItemImages(item);
    // Delete the item document
    await deleteDoc(doc(db, "items", item.id));
  });

  // Wait for all items to be deleted
  await Promise.all(deletePromises);

  // Finally, delete the item type
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
  // First, get the item to access its images
  const docRef = doc(db, "items", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const item = { id: docSnap.id, ...docSnap.data() };

    // Delete all images associated with this item
    await deleteItemImages(item);

    // Delete the item document
    await deleteDoc(docRef);
  } else {
    // If item doesn't exist, just try to delete the document reference
    await deleteDoc(docRef);
  }
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

export async function updateLogEntry(id, data) {
  const docRef = doc(db, "logEntries", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLogEntry(id) {
  const docRef = doc(db, "logEntries", id);
  await deleteDoc(docRef);
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
  try {
    // Create a thumbnail version of the image
    const thumbnailFile = await resizeImage(file, 400, 400, 0.7);

    // Create paths for both versions
    const thumbnailPath = path.replace(/(\.[^.]+)$/, "_thumbnail$1");

    // Upload both versions to Firebase Storage
    const storageRef = ref(storage, path);
    const thumbnailRef = ref(storage, thumbnailPath);

    // Upload both files in parallel
    const [snapshot, thumbnailSnapshot] = await Promise.all([
      uploadBytes(storageRef, file),
      uploadBytes(thumbnailRef, thumbnailFile),
    ]);

    // Get download URLs for both versions
    const [url, thumbnailUrl] = await Promise.all([
      getDownloadURL(snapshot.ref),
      getDownloadURL(thumbnailSnapshot.ref),
    ]);

    // Return the image data with both URLs
    return {
      url,
      thumbnailUrl,
      path,
      thumbnailPath,
      name: file.name,
      type: file.type,
      size: file.size,
      thumbnailSize: thumbnailFile.size,
    };
  } catch (error) {
    console.error("Error in uploadImage:", error);
    throw error;
  }
}
