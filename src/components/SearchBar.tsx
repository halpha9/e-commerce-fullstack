import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import * as F from "fuse.js";
import * as _ from "lodash";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  placeholder?: string;
  originalData: any[];
  setResult: (result: any[] | null) => void;
  searchValue: string;
  searchKeysArray?: string[];
  setSearchValue: (value: string) => void;
};

export default function SearchBar({
  placeholder = "Search…",
  originalData,
  setResult,
  searchKeysArray = ["title"],
  searchValue,
  setSearchValue,
}: Props) {
  const fuse = useRef(
    new F.default(originalData, {
      includeMatches: true,
      minMatchCharLength: 3,
      threshold: 0.2,
      keys: searchKeysArray,
    })
  );

  useEffect(() => {
    fuse.current = new F.default(originalData, {
      includeMatches: true,
      minMatchCharLength: 1,
      threshold: 0.2,
      keys: searchKeysArray,
    });
  }, [originalData]);

  useEffect(() => {
    if (searchValue && searchValue.length > 1) {
      let result = fuse.current.search(searchValue);
      result = result.map((item) => {
        return item.item;
      });
      setResult(result);
    } else {
      setResult(null);
    }
  }, [searchValue, originalData]);

  return (
    <div className="form-control">
      <div className="form-control ">
        <div className="input-group">
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder={placeholder}
            className="input-bordered input h-12"
          />
          <button className="btn btn-square">
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
