import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('input'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

let pageNumber = 1;

refs.btnLoadMore.style.display = 'none';
refs.form.addEventListener('submit', onSearch);
refs.btnLoadMore.addEventListener('click', onBtnLoadMore);

function onSearch(evt) {
  evt.preventDefault();

  pageNumber = 1;
  refs.gallery.innerHTML = '';

  const newInput = refs.input.value.trim();

  if (newInput !== '') {
    getPhotos(newInput);
  } else {
    refs.btnLoadMore.style.display = 'none';
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

function onBtnLoadMore() {
  const newInput = refs.input.value.trim();
  pageNumber += 1;
  getPhotos(newInput, pageNumber);
}

async function getPhotos(newInput, pageNumber) {
  const API_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '34508130-da8062709c252780d693a77a6',
      q: newInput,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: pageNumber,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(API_URL, options);

    notification(response.data.hits.length, response.data.total);

    createMarkup(response.data);
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(arrayOfPhotos) {
  const markup = arrayOfPhotos.hits
    .map(
      element => `<a class= "photo-link" href = "${element.largeImageURL}" >
      <div class="photo-card">
            <div class="photo">
            <img src="${element.webformatURL}" alt="${element.tags}" loading="lazy"/>
            </div>
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${element.likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${element.views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${element.comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${element.downloads}
                        </p>
            </div>
      </div>
            </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function notification(length, totalHits) {
  if (length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (pageNumber === 1) {
    refs.btnLoadMore.style.display = 'flex';

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (length < 40) {
    refs.btnLoadMore.style.display = 'none';

    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}
