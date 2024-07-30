import { useEffect, useState } from "react";

const KEY = "33c0c1af";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      callback?.();

      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Something went Wrong");
          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not Found!");

          setMovies(data.Search);
          // console.log(data.Search);
          setError("");
          // setIsLoading(false);
        } catch (err) {
          if (!err.name !== "AbortName") {
            // console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      //   handleOnCloseMovieDetail();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query,]
  );

  return { movies, isLoading, error };
}
