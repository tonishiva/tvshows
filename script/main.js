// Menu
const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";
const API_KEY = "b6b8acad0fb9e0162faf2162ce2b498c"
const API_URL = 'https://api.themoviedb.org/3';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardIMG = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const preloader = document.querySelector('.preloader');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const pagination = document.querySelector('.pagination');
const trailer = document.getElementById('trailer');
const headTrailer = document.getElementById('head-trailer');
let paginationContext = '';
let currentPage = 1;
let lastPage;



const loading = document.createElement('div');
loading.className = 'loading';

const DBService = class {
    getData = async(url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные с ${url}`);
        }
    }

    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResults = (query) => {
        paginationContext = 'search';
        currentPage = 1;
        this.searchUrl = `${API_URL}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`;
        return this.getData(this.searchUrl);
    }

    getTvShow = (id) => {
        return this.getData(`${API_URL}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    }

    getTopRated = () => {
        currentPage = 1;
        paginationContext = 'topResults';
        this.topRatedUrl = `${API_URL}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`;
        return this.getData(this.topRatedUrl);
    }

    getPopular = () => {
        currentPage = 1;
        paginationContext = 'popular';
        this.popularUrl = `${API_URL}/tv/popular?api_key=${API_KEY}&language=ru-RU`;
        return this.getData(this.popularUrl);
    }

    getNewEpisodeToday = () => {
        currentPage = 1;
        paginationContext = 'newEpisodesToday';
        this.newEpisodesTodayUrl = `${API_URL}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`;
        return this.getData(this.newEpisodesTodayUrl);
    }

    getNewEpisodesWeek = () => {
        currentPage = 1;
        paginationContext = 'newEpisodesWeek';
        this.newEpisodesWeekUrl = `${API_URL}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`
        return this.getData(this.newEpisodesWeekUrl);
    }

    getNextPage = (page, context) => {
        currentPage = page;
        switch (context) {
            case 'search':
                return this.getData(this.searchUrl + `&page=${page}`);
            case 'topResults':
                return this.getData(this.topRatedUrl + `&page=${page}`);
            case 'popular':
                return this.getData(this.popularUrl + `&page=${page}`);
            case 'newEpisodesToday':
                return this.getData(this.newEpisodesTodayUrl + `&page=${page}`);
            case 'newEpisodesWeek':
                return this.getData(this.newEpisodesWeekUrl + `&page=${page}`);
            case 'trandingWeek':
                return this.getData(this.trandingUrl + `&page=${page}`)
        }
    }

    getVideo = id => {
        return this.getData(`${API_URL}/tv/${id}/videos?api_key=${API_KEY}&language=ru-RU`);
    }

    getTranding = () => {
        currentPage = 1;
        paginationContext = 'trandingWeek';
        this.trandingUrl = `${API_URL}/trending/tv/week?api_key=${API_KEY}`;
        return this.getData(this.trandingUrl);
    }
}

const dbService = new DBService();

const renderCard = (response, target) => {
    tvShowList.textContent = '';

    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожалению, по вашему запросу ничего не найдено...';
        return;
    }
    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';

    if (paginationContext == 'trandingWeek') {
        tvShowsHead.textContent = '';
    }

    response.results.forEach(item => {
        const {
            backdrop_path: backdrop,
            id,
            name: title,
            poster_path: poster,
            vote_average: vote,
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropeIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.classList.add('tv-shows__item');
        card.innerHTML = `
            <a href="#" class="tv-card" id=${id}>
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropeIMG}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>     
        `;
        loading.remove();
        tvShowList.append(card);
    });

    pagination.textContent = '';
    lastPage = +response.total_pages;

    if (response.total_pages > 1) {
        let paginationArray = [];
        let filteredArray = [];
        const paginationStart = `<li><a href="#" class="pages-start">В начало</a></li>`;
        const paginationEnd = `<li><a href="#" class="pages-end">В конец</a></li>`;
        let paginationBody = '';
        for (let i = 1; i <= response.total_pages; i++) {
            paginationArray.push(i);
        }
        if (response.total_pages > 10 && currentPage > 5) {
            filteredArray = paginationArray.filter(item => (item > currentPage - 5) && (item <= currentPage + 5));
        } else {
            filteredArray = paginationArray.filter(item => item <= 10);
        }
        filteredArray.forEach(item => {
            paginationBody += `<li><a href="#" class="pages">${item}</a></li>`;
            pagination.innerHTML = paginationStart + paginationBody + paginationEnd;
        });
        let page = document.querySelectorAll('.pages');
        page.forEach(item => {
            item.classList.remove('active-page');
            if (+item.textContent == currentPage) {
                item.classList.add('active-page');
            }
        });
    }
};

tvShows.append(loading);
dbService.getTranding().then(renderCard);

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if (value) {
        tvShows.append(loading);
        dbService.getSearchResults(value).then(renderCard);
    }
    searchFormInput.value = '';
});

// открытие/закрытие меню

const dropdownCollapse = () => {
    dropdown.forEach((item) => {
        item.classList.remove('active');
    })
};

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    dropdownCollapse();
});

const menuCollapse = () => {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    dropdownCollapse();
}

document.body.addEventListener('click', event => {

    if (!event.target.closest('.left-menu')) {
        menuCollapse();
    }
});

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
    if (target.closest('#top-rated')) {
        tvShows.append(loading);
        dbService.getTopRated().then((response) => renderCard(response, target));
        menuCollapse();

    }
    if (target.closest('#popular')) {
        tvShows.append(loading);
        dbService.getPopular().then((response) => renderCard(response, target));
        menuCollapse();
    }
    if (target.closest('#today')) {
        tvShows.append(loading);
        dbService.getNewEpisodeToday().then((response) => renderCard(response, target));
        menuCollapse();
    }
    if (target.closest('#week')) {
        tvShows.append(loading);
        dbService.getNewEpisodesWeek().then((response) => renderCard(response, target));
        menuCollapse();
    }

    if (target.closest('#search')) {
        pagination.textContent = '';
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
        menuCollapse();
        searchFormInput.focus();
    }
});

// открытие модального окна

tvShowList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {

        preloader.style.display = 'block';

        dbService.getTvShow(card.id)
            .then(response => {
                if (!response.poster_path) {
                    tvCardIMG.src = 'img/no-poster.jpg'
                } else {
                    tvCardIMG.src = IMG_URL + response.poster_path;
                }

                tvCardIMG.alt = response.name;
                modalTitle.textContent = response.name;
                // genresList.innerHTML = response.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
                genresList.textContent = '';
                for (const item of response.genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = response.vote_average;
                description.textContent = response.overview;
                modalLink.href = response.homepage;
                return response.id;
            })
            .then(dbService.getVideo)
            .then(response => {
                headTrailer.classList.add('hide');
                trailer.textContent = '';
                if (response.results.length) {
                    headTrailer.classList.remove('hide');
                    response.results.forEach(item => {
                        const trailerItem = document.createElement('li');
                        trailerItem.innerHTML = `
                        <iframe 
                            width="400" 
                            height="300" 
                            src="https://www.youtube.com/embed/${item.key}" 
                            frameborder="0" 
                            allowfullscreen>
                        </iframe>
                        <h4>${item.name}</h4>`;
                        trailer.append(trailerItem);
                    })
                }
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = 'none';
            });
    }
});

// закрытие модального окна

modal.addEventListener('click', event => {
    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

// смена карточки

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
        }
    }
};

tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains('pages')) {
        tvShows.append(loading);
        currentPage = +target.textContent;
        dbService.getNextPage(currentPage, paginationContext).then(renderCard);
    } else if (target.classList.contains('pages-start')) {
        tvShows.append(loading);
        currentPage = 1;
        dbService.getNextPage(currentPage, paginationContext).then(renderCard);
    } else if (target.classList.contains('pages-end')) {
        tvShows.append(loading);
        currentPage = lastPage;
        dbService.getNextPage(currentPage, paginationContext).then(renderCard);
    }
});