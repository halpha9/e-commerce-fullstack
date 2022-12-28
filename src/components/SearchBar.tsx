import * as F from "fuse.js";
import * as _ from "lodash";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  placeholder?: string;
  originalData: any[];
  setResult: (result: any[] | null) => void;
  searchKeysArray?: string[];
};

export default function SearchBar({
  placeholder = "Search…",
  originalData,
  setResult,
  searchKeysArray = ["title"],
}: Props) {
  const [state, setState] = useState({
    search: "",
  });

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
    if (state.search && state.search.length > 1) {
      let result = fuse.current.search(state.search);
      result = result.map((item) => {
        return item.item;
      });
      setResult(result);
    } else {
      setResult(null);
    }
  }, [state.search, originalData]);

  return (
    <div className="form-control">
      <div className="input-group">
        <input
          onChange={(e) =>
            setState((s) => ({
              ...s,
              search: e.target.value,
            }))
          }
          type="text"
          placeholder={placeholder}
          className="input-bordered input w-full max-w-xs"
        />
      </div>
    </div>
  );
}
