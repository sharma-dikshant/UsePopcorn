import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "33c0c1af";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  // const [watched, setWatched] = useState([]);

  const [watched, setWatched] = useState(function () {
    return JSON.parse(localStorage.getItem("movies"));
  });

  // ⬆️this method is more preferred and it ensure that the function only executes once.

  // const [watched, setWatched] = useState(
  //   JSON.parse(localStorage.getItem("movies"))
  // );

  //! experiments to see the timeLines of different effects
  /*
  useEffect(function () {
    console.log("A");
  }, []);

  useEffect(function () {
    console.log("B");
  });

  console.log("C");
 */
  //!===============================================

  function onSelectMovie(id) {
    setSelectedID((prev) => (prev === id ? null : id));
  }

  function handleOnCloseMovieDetail() {
    setSelectedID(null);
  }

  function handleOnAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
    //! storing watched movies to localStorage
    // localStorage.setItem("movies", JSON.stringify([...watched, movie]));
    // //⬆️ here we have to pass new array because the watched state does'nt updates immediately
  }

  function handleOnDeleteMovie(id) {
    setWatched((movies) => movies.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem("movies", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
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

      handleOnCloseMovieDetail();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={onSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              onCloseMovieDetail={handleOnCloseMovieDetail}
              onAddWatchedMovie={handleOnAddWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                OnDeleteMovie={handleOnDeleteMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⚠️</span>
      {message}
    </p>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  //! to focus to input field as soon as the page loaded

  //⬇️but this method is more imperative and not react type

  // useEffect(function () {
  //   const el = document.querySelector(".search");
  //   el.focus();
  // }, []);

  // another way is to use refs

  const inputEl = useRef(null);

  // useEffect(() => {
  //   inputEl.current.focus();
  // }, []);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return;
      if (e.code === "Enter") {
        setQuery("");
        inputEl.current.focus();
      }
    }

    document.addEventListener("keydown", callback);
  }, []);

  // // useEffect(function (e) {
  // //   function callback() {
  // //     if ((e.code = "Enter")) {
  // //       setQuery("");
  // //       inputEl.current.focus();
  // //     }
  // //   }
  // //   callback();
  // //   document.addEventListener("keydown", callback);
  // // }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedID,
  onCloseMovieDetail,
  onAddWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedID);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // console.log(title, year);

  //! testing react hook rules

  // if (imdbRating > 8) {
  //   const [isTop, setIsTop] = useState(true);
  // }

  // if (imdbRating > 8) return <p>Best Movie</p>;

  function handleAddMovie() {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatchedMovie(newWatchedMovie);
    onCloseMovieDetail();
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovieDetail();
          // console.log("closing");
        }
      }
      document.addEventListener("keydown", callback);

      // to ensure that as soon as the component unmount the event listener should be removed
      return () => document.removeEventListener("keydown", callback);
    },
    [onCloseMovieDetail]
  );

  useEffect(
    function () {
      async function fetchDetails() {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`
        );
        const data = await res.json();
        // console.log(data);
        setMovie(data);
      }

      fetchDetails();
    },
    [selectedID]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        // console.log(`clean up function for ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {/* <header>
        <button className="btn-back" onClick={onCloseMovieDetail}>
          {" "}
          &larr;
        </button>
        <img src={poster} alt={`poster of ${movie}`} />
      </header> */}
      <header>
        <button className="btn-back" onClick={onCloseMovieDetail}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAddMovie}>
                  Add to watchList
                </button>
              )}
            </>
          ) : (
            <p>You've added this movie.</p>
          )}
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by {director}</p>
      </section>
    </div>
  );
}

/*function WatchedBox() {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </>
      )}
    </div>
  );
}
  */

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, OnDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          OnDeleteMovie={OnDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, OnDeleteMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <p>
          <button
            className="btn-delete"
            onClick={() => OnDeleteMovie(movie.imdbID)}
          >
            X
          </button>
        </p>
      </div>
    </li>
  );
}
