import * as firestore from "firebase/firestore";
import * as firebasestorage from "firebase/storage";
import useSWR from "swr";
import * as datefns from "date-fns";
import { Geohash, geohashForLocation } from "geofire-common";

import { db, getCurrentUser } from "./firebase";
import { useEffect, useState } from "react";

export interface DailyFragment {
  id: string;
  createdAt: Date;
  type: "text" | "image" | "location";

  contentText?: string;
  contentImageRef?: string;
  contentImageHeight?: number;
  contentImageWidth?: number;
  contentLocationGeoHash?: Geohash;
  contentLocationLatitude?: number;
  contentLocationLongitude?: number;
}

async function getDailyFragments(date: string): Promise<DailyFragment[]> {
  const user = getCurrentUser();
  const fragments = await firestore.getDocs(
    firestore.query(
      firestore.collection(db, "users", user.uid, "daily", date, "fragments"),
      firestore.orderBy("createdAt", "asc"),
    ),
  );
  return fragments.docs.map((doc) => {
    const d = doc.data();
    d["createdAt"] = d["createdAt"].toDate();
    return d as DailyFragment;
  });
}

async function setFragment(
  date: string,
  fragment: DailyFragment,
): Promise<void> {
  const user = getCurrentUser();
  return firestore.setDoc(
    firestore.doc(
      db,
      "users",
      user.uid,
      "daily",
      date,
      "fragments",
      fragment.id,
    ),
    fragment,
  );
}

async function deleteFragment(date: string, fragmentId: string): Promise<void> {
  const user = getCurrentUser();
  return firestore.deleteDoc(
    firestore.doc(
      db,
      "users",
      user.uid,
      "daily",
      date,
      "fragments",
      fragmentId,
    ),
  );
}

export function useDailyFragments(date: Date): {
  fragments: DailyFragment[] | null;
  error: Error | null;
  setFragment: (fragment: DailyFragment) => Promise<void>;
  deleteFragment: (fragmentId: string) => Promise<void>;
} {
  const dateStr = datefns.formatISO(date, { representation: "date" });
  const { data, error, mutate } = useSWR(dateStr, getDailyFragments);

  return {
    fragments: data ?? null,
    error: error ?? null,
    setFragment: async (fragment: DailyFragment) => {
      await setFragment(dateStr, fragment);
      mutate();
    },
    deleteFragment: async (fragmentId: string) => {
      await deleteFragment(dateStr, fragmentId);
      mutate();
    },
  };
}

export async function buildImageFragment(
  jpgImage: Blob,
): Promise<DailyFragment> {
  const image = await createImageBitmap(jpgImage);
  const height = image.height;
  const width = image.width;
  image.close();

  const id = crypto.randomUUID();
  const storage = firebasestorage.getStorage();
  const storageRef = firebasestorage.ref(
    storage,
    `users/${getCurrentUser().uid}/images/${id}.jpg`,
  );
  const result = await firebasestorage.uploadBytes(storageRef, jpgImage);
  return {
    id: id,
    createdAt: new Date(),
    type: "image",
    contentImageRef: result.ref.toString(),
    contentImageHeight: height,
    contentImageWidth: width,
  };
}

export async function buildLocationFragment(): Promise<DailyFragment> {
  const locPromise = new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  const loc = await locPromise;
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    type: "location",
    contentLocationGeoHash: geohashForLocation([
      loc.coords.latitude,
      loc.coords.longitude,
    ]),
    contentLocationLatitude: loc.coords.latitude,
    contentLocationLongitude: loc.coords.longitude,
  };
}

export interface ResolvedImageFragment {
  url: string | null;
  error: string | null;
  width: number;
  height: number;
}

export function useImageFragment(
  fragment: DailyFragment,
): ResolvedImageFragment | null {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (fragment.type !== "image") {
    return null;
  }
  useEffect(() => {
    const storage = firebasestorage.getStorage();
    const storageRef = firebasestorage.ref(storage, fragment.contentImageRef);
    firebasestorage
      .getDownloadURL(storageRef)
      .then((url) => setUrl(url))
      .catch((e) => setError(e));
  }, [setUrl]);
  return {
    url,
    error,
    width: fragment.contentImageWidth ?? 0,
    height: fragment.contentImageHeight ?? 0,
  };
}
