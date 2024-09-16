"use client";

import * as datefns from "date-fns";
import Image from "next/image";
import { AdvancedMarker, Map as GMap } from "@vis.gl/react-google-maps";

import {
  buildImageFragment,
  buildLocationFragment,
  DailyFragment,
  useDailyFragments,
  useImageFragment,
} from "@/components/firebase-daily-fragments";
import { useId } from "react";

export default function Page() {
  const date = new Date();
  const dateStr = datefns.formatISO(date, { representation: "date" });
  const { fragments, setFragment } = useDailyFragments(date);

  if (fragments === null) {
    return (
      <div className="max-w-lg p-4">
        <h1 className="text-lg">{dateStr}</h1>
      </div>
    );
  }

  return (
    <div className="max-w-lg p-4 space-y-2">
      <h1 className="text-xl font-bold">{dateStr}</h1>
      {fragments.map((fragment, index) => (
        <RenderFragment key={index} fragment={fragment} />
      ))}
      <div className="sticky bottom-0 bg-white opacity-80">
        <Control setFragment={setFragment} />
      </div>
    </div>
  );
}

function RenderFragment({ fragment }: { fragment: DailyFragment }) {
  const imageFragment = useImageFragment(fragment);
  if (imageFragment) {
    return (
      <div>
        {imageFragment.url ? (
          <Image
            src={imageFragment.url}
            alt="image"
            placeholder="empty"
            width={imageFragment.width}
            height={imageFragment.height}
          />
        ) : (
          <canvas
            className="max-w-full"
            width={imageFragment.width}
            height={imageFragment.height}
          />
        )}
        <p className="text-sm text-gray-400 text-right">
          {datefns.format(fragment.createdAt, "HH:mm")}
        </p>
      </div>
    );
  }
  if (fragment.type === "location") {
    return (
      <div>
        <GMap
          mapId={`map-${fragment.id}`}
          className="h-48"
          defaultCenter={{
            lat: fragment.contentLocationLatitude ?? 0,
            lng: fragment.contentLocationLongitude ?? 0,
          }}
          defaultZoom={16}
          disableDefaultUI={true}
        >
          <AdvancedMarker
            position={{
              lat: fragment.contentLocationLatitude ?? 0,
              lng: fragment.contentLocationLongitude ?? 0,
            }}
          />
        </GMap>
        <p className="text-sm text-gray-400 text-right">
          {datefns.format(fragment.createdAt, "HH:mm")}
        </p>
      </div>
    );
  }
  return null;
}

function Control({
  setFragment,
}: {
  setFragment: (fragment: DailyFragment) => Promise<void>;
}) {
  const imageButtonID = useId();
  const galleryUploadID = useId();

  const captureLocation = async () => {
    await setFragment(await buildLocationFragment());
  };
  const processPhotos = async (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }
    for (let i = 0; i < fileList.length; i++) {
      await setFragment(await buildImageFragment(fileList[i]));
    }
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex gap-2">
        <label
          className="block text-center w-1/2 p-3 border border-black rounded"
          htmlFor={galleryUploadID}
        >
          ギャラリー
        </label>
        <input
          id={galleryUploadID}
          className="opacity-0 size-0 absolute"
          type="file"
          accept="image/jpeg"
          onChange={(e) => {
            processPhotos(e.target.files);
          }}
        />
        <label
          className="block text-center w-1/2 p-3 border border-black rounded"
          htmlFor={imageButtonID}
        >
          カメラ
        </label>
        <input
          id={imageButtonID}
          className="opacity-0 size-0 absolute"
          type="file"
          accept="image/jpeg"
          capture="environment"
          onChange={(e) => {
            processPhotos(e.target.files);
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="text-center w-full p-3 border border-black rounded"
          onClick={() => captureLocation()}
        >
          位置情報を追加
        </button>
      </div>
    </div>
  );
}
