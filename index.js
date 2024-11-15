
const button = document.querySelector('#button')
const movieGrid = document.querySelector(".movie-grid")
const mainTitle = document.querySelector("#mainTitle")
const details_area = document.querySelector(".details_area")
const page = document.querySelector(".pagination")
const watchlist = document.querySelector("#watchlist")
const filterButton = document.querySelector("#filterButton")



const WatchlistStore = []

let currentPage = 1;
const limit = 10; // Number of items per page


button.addEventListener("click", (e) => {
  e.preventDefault()
  const title = document.querySelector('#search').value.trim()

  searchMovies(title)

})

filterButton.addEventListener("click", (e) => {
  e.preventDefault()
  const genre = document.querySelector("#genre").value

  filterMovies(genre)
})

mainTitle.addEventListener("click", (e) => {
  fetchMovies(currentPage)

})

watchlist.addEventListener("click", (e) => {
  displayWatchlist(WatchlistStore)
})

async function filterMovies(genre) {
  movieGrid.innerHTML = ""
  details_area.innerHTML = ""
  page.innerHTML = ""

  const response = await fetch(`https://yts.mx/api/v2/list_movies.json?&genre=${genre}`);
  const data = await response.json();

  if (data && data.data) {
    displayMovies(data.data.movies);
  }
}

async function searchMovies(title) {
  movieGrid.innerHTML = ""
  details_area.innerHTML = ""
  page.innerHTML = ""

  const response = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(title)}`);
  const data = await response.json();

  if (data && data.data) {
    displayMovies(data.data.movies);
  }
}


async function fetchMovies(page) {
  details_area.innerHTML = ""


  const response = await fetch(`https://yts.mx/api/v2/list_movies.json?sort=seeds&limit=${limit}&page=${page}`);
  const data = await response.json();

  if (data && data.data) {
    displayMovies(data.data.movies);
    updatePageInfo(page, data.data.movie_count, limit);
  }
}

function displayMovies(data) {
  movieGrid.innerHTML = ""

  data.forEach(element => {
    const card = document.createElement('div')
    card.className = 'movie-card'

    card.innerHTML = `
            <img src="${element.large_cover_image}" alt="${element.title}">
            <div class="movie-title">${element.title}</div>
            <div class="movie-year">${element.year}</div>
            `
    card.addEventListener("click", () => { moreDetails(element) })
    movieGrid.appendChild(card)
  });

}

function updatePageInfo(page, totalMovies, limit) {
  const pageInfo = document.getElementById('page-info');
  const totalPages = Math.ceil(totalMovies / limit);
  pageInfo.innerText = `Page ${page} of ${totalPages}`;
}

function changePage(direction) {
  if (direction === 'next') {
    currentPage++;
  } else if (direction === 'prev' && currentPage > 1) {
    currentPage--;
  }
  fetchMovies(currentPage);
}

// Initial fetch
fetchMovies(currentPage);


function moreDetails(element) {
  movieGrid.innerHTML = ""
  details_area.innerHTML = ""
  page.innerHTML = ""


  const card = document.createElement('div')
  const details = document.createElement('div')

  card.className = 'movie-card'
  card.innerHTML = `
            <img src="${element.large_cover_image}" alt="${element.title}">
            <div class="movie-title">${element.title}</div>
            <div class="movie-year">${element.year}</div>
            <button id="watchlistButton" class='button'>+watchlist</button>
            `
  const watchlistButton = card.querySelector("#watchlistButton")

  watchlistButton.addEventListener("click", () => { myWatchlist(element) })


  const trailerUrl = `https://www.youtube.com/embed/${element.yt_trailer_code}`;

  details.innerHTML = `
      <div class="movie-details">
        <h1 id="movie-title">${element.title}</h1>
        <p>Watch the official trailer below:</p>
        <div class="trailer-container">
          <iframe src="${trailerUrl}" id="trailer" allowfullscreen></iframe>
        </div>
        <div class="paragraph">${element.description_full}</div>
      </div>
  `

  details_area.appendChild(card)
  myDownload(element)
  details_area.appendChild(details)

}
function myWatchlist(element) {
  WatchlistStore.push(element)
  console.log(WatchlistStore);

}

function displayWatchlist(movies) {
  movieGrid.innerHTML = ""
  details_area.innerHTML = ""
  page.innerHTML = ""

  movies.forEach((movie, index) => {
    const card = document.createElement('div')
    card.className = 'movie-card'
    card.innerHTML = `
            <img src="${movie.large_cover_image}" alt="${movie.title}">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-year">${movie.year}</div>
            <button id="remove" class="button">remove</button>
            `
    card.addEventListener("click", () => { moreDetails(movie) })
    const remove = card.querySelector("#remove")
    remove.addEventListener('click', () => { removeMovie(index) })
    movieGrid.appendChild(card)

  });
}

function removeMovie(index) {
  WatchlistStore.splice(index, 1)
  displayWatchlist(WatchlistStore)
}


function myDownload(movie) {
  movie.torrents.forEach(torrent => {
    const quality = torrent.quality;
    const url = torrent.url;

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.className = "download"
    downloadLink.href = url;
    downloadLink.textContent = `Download ${quality.toUpperCase()}`;

    details_area.appendChild(downloadLink);
  })
}