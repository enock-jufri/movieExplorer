const button = document.querySelector('#button');
const searchForm = document.querySelector('.search');
const movieGrid = document.querySelector('.movie-grid');
const mainTitle = document.querySelector('#mainTitle');
const detailsArea = document.querySelector('.details_area');
const page = document.querySelector('.pagination');
const watchlist = document.querySelector('#watchlist');
const filterButton = document.querySelector('#filterButton');

const watchlistStore = [];

let currentPage = 1;
const limit = 10; // Number of items per page

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = document.querySelector('#search').value.trim();
  searchMovies(title);
});

filterButton.addEventListener('click', event => {
  event.preventDefault();
  const genre = document.querySelector('#genre').value;
  filterMovies(genre);
});

mainTitle.addEventListener('click', () => {
  movieGrid.innerHTML = '';
  detailsArea.innerHTML = '';
  // Do NOT clear page.innerHTML here, so pagination remains visible
  fetchMovies(currentPage);
});

watchlist.addEventListener('click', () => {
  displayWatchlist(watchlistStore);
});

async function filterMovies(genre) {
  movieGrid.innerHTML = '';
  detailsArea.innerHTML = '';
  page.innerHTML = '';

  const response = await fetch(`https://yts.mx/api/v2/list_movies.json?&genre=${genre}`);
  const data = await response.json();

  if (data && data.data) {
    displayMovies(data.data.movies);
  }
}

async function searchMovies(title) {
  movieGrid.innerHTML = '';
  detailsArea.innerHTML = '';
  page.innerHTML = '';

  const response = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(title)}`);
  const data = await response.json();

  if (data && data.data) {
    displayMovies(data.data.movies);
  }
}

async function fetchMovies(pageNum) {
  detailsArea.innerHTML = '';

  const response = await fetch(`https://yts.mx/api/v2/list_movies.json?sort=seeds&limit=${limit}&page=${pageNum}`);
  const data = await response.json();

  if (data && data.data) {
    displayMovies(data.data.movies);
    updatePageInfo(pageNum, data.data.movie_count, limit);
  }
}

function displayMovies(data) {
  movieGrid.innerHTML = '';

  data.forEach(element => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <img src="${element.large_cover_image}" alt="Poster for ${element.title}">
      <div class="movie-title">${element.title}</div>
      <div class="movie-year">${element.year}</div>
    `;
    card.addEventListener('click', () => { moreDetails(element); });
    movieGrid.appendChild(card);
  });
}

function updatePageInfo(current, totalMovies, limit) {
  const pageInfo = document.getElementById('page-info');
  const paginationContainer = document.querySelector('.pagination-container');
  const totalPages = Math.ceil(totalMovies / limit);

  // Clear old pagination
  paginationContainer.innerHTML = '';

  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.textContent = '<<';
  prevBtn.disabled = current === 1;
  prevBtn.onclick = () => changePage('prev');
  paginationContainer.appendChild(prevBtn);

  // Page number buttons (show window of 2 before/after current)
  let start = Math.max(1, current - 2);
  let end = Math.min(totalPages, current + 2);
  if (current <= 3) end = Math.min(5, totalPages);
  if (current >= totalPages - 2) start = Math.max(1, totalPages - 4);

  for (let i = start; i <= end; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.textContent = i;
    if (i === current) {
      pageBtn.disabled = true;
      pageBtn.style.backgroundColor = '#1d4ed8';
      pageBtn.style.fontWeight = 'bold';
    }
    pageBtn.onclick = () => {
      currentPage = i;
      fetchMovies(currentPage);
    };
    paginationContainer.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.textContent = '>>';
  nextBtn.disabled = current === totalPages;
  nextBtn.onclick = () => changePage('next');
  paginationContainer.appendChild(nextBtn);

  // Optional: show "Page X of Y"
  pageInfo.textContent = `Page ${current} of ${totalPages}`;
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
  movieGrid.innerHTML = '';
  detailsArea.innerHTML = '';
  page.innerHTML = '';

  // Create main details card container
  const detailsCard = document.createElement('div');
  detailsCard.className = 'movie-details-card';

  // Poster section
  const posterDiv = document.createElement('div');
  posterDiv.className = 'movie-details-poster';
  posterDiv.innerHTML = `
    <img src="${element.large_cover_image}" alt="Poster for ${element.title}">
  `;

  // Actions (watchlist + downloads) below poster
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'movie-details-actions';
  actionsDiv.innerHTML = `
    <button id="watchlistButton" class="button">+ Watchlist</button>
    <div class="movie-details-downloads"></div>
  `;
  actionsDiv.querySelector('#watchlistButton').addEventListener('click', () => { addToWatchlist(element); });
  const downloadsDiv = actionsDiv.querySelector('.movie-details-downloads');
  element.torrents.forEach(torrent => {
    const quality = torrent.quality;
    const url = torrent.url;
    const downloadLink = document.createElement('a');
    downloadLink.className = 'download';
    downloadLink.href = url;
    downloadLink.textContent = `Download ${quality.toUpperCase()}`;
    downloadsDiv.appendChild(downloadLink);
  });
  posterDiv.appendChild(actionsDiv);

  // Info section
  const infoDiv = document.createElement('div');
  infoDiv.className = 'movie-details-info';
  infoDiv.innerHTML = `
    <h1 class="movie-details-title">${element.title}</h1>
    <div class="movie-details-trailer">
      <div class="trailer-container">
        <iframe src="https://www.youtube.com/embed/${element.yt_trailer_code}" id="trailer" allowfullscreen></iframe>
      </div>
    </div>
    <h2 class="movie-details-year">${element.year}</h2>
    <div class="movie-details-description">${element.description_full}</div>
  `;

  // Compose card
  detailsCard.appendChild(posterDiv);
  detailsCard.appendChild(infoDiv);

  detailsArea.appendChild(detailsCard);
}

function addToWatchlist(element) {
  watchlistStore.push(element);
  console.log(watchlistStore);
}

function displayWatchlist(movies) {
  movieGrid.innerHTML = '';
  detailsArea.innerHTML = '';
  page.innerHTML = '';

  movies.forEach((movie, index) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${movie.large_cover_image}" alt="Poster for ${movie.title}">
      <div class="movie-title">${movie.title}</div>
      <div class="movie-year">${movie.year}</div>
      <button id="remove" class="button">remove</button>
    `;
    card.addEventListener('click', () => { moreDetails(movie); });
    const remove = card.querySelector('#remove');
    remove.addEventListener('click', event => {
      event.stopPropagation();
      removeMovie(index);
    });
    movieGrid.appendChild(card);
  });
}

function removeMovie(index) {
  watchlistStore.splice(index, 1);
  displayWatchlist(watchlistStore);
}