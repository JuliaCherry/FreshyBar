const API_URL = 'https://chain-perpetual-chord.glitch.me/';

const getData = async () => {
  const responce = await fetch(`${API_URL}api/goods`);
  const data = await responce.json();
  return data;
};

const createCard = item => {
  const coctail = document.createElement('article');
  coctail.classList.add('cocktail');
  coctail.innerHTML = `
  <img
        src='${API_URL}${item.image}'
            alt="Коктейль ${item.title}"
        class="cocktail__img"/>
    <div class="cocktail__text">
    <h3 class="cocktail__title">'${item.title}'</h3>
    <p class="cocktail__price text-red">${item.price} ₽</p>
    <p class="cocktail__size">${item.size}</p>
    </div>
    <button class="btn cocktail__btn cocktail__btn-add" data-id="${item.id}">Добавить</button>
     `;
  return coctail;
};

const scrollService = {
  scrollPosition: 0,
  disabledScroll() {
    this.scrollPosition = window.scrollY;
    document.style.scrollBehavior = 'auto';

    document.body.style.cssText = `
    overflow: hidden;
    position: fixed;
    top: -${this.scrollPosition}px;
    left: 0;
    height: 100vh;
    width: 100vw;
    padding-right: ${window.innerWidth - document.body.offsetWidth}px;
    `;
  },
  enabledScroll() {
    document.body.style.cssText = '';
    window.scroll({ top: this.scrollPosition });
    document.documentElement.style.scrollBehavior = '';
  },
};

const modalController = ({ modal, btnOpen, time = 300 }) => {
  const buttonElems = document.querySelectorAll(btnOpen);
  const modalElem = document.querySelector(modal);

  modalElem.style.cssText = `
  display: flex;
  visibility: hidden;
  opacity: 0;
  transition: opasity ${time}ms ease-in-out;
  `;

  const closeModal = event => {
    const target = event.target;
    const code = event.code;

    if (target === modalElem || code === 'Escape') {
      modalElem.style.opacity = 0;

      setTimeout(() => {
        modalElem.style.visibility = 'hidden';
        scrollService.enabledScroll();
      }, time);

      window.removeEventListener('keydown', closeModal);
    }
  };

  const openModal = () => {
    modalElem.style.visibility = 'visible';
    modalElem.style.opacity = 1;
    window.addEventListener('keydown', closeModal);
    scrollService.disabledScroll;
  };

  buttonElems.forEach(buttonElem => {
    buttonElem.addEventListener('click', openModal);
  });

  modalElem.addEventListener('click', closeModal);

  return { openModal, closeModal };
};

const init = async () => {
  modalController({
    modal: '.modal-order',
    btnOpen: '.header__btn-order',
  });

  const goodsListElem = document.querySelector('.goods__list');
  const data = await getData();

  const cardsCoctail = data.map(item => {
    const li = document.createElement('li');
    li.classList.add('goods__item');
    li.append(createCard(item));

    return li;
  });

  goodsListElem.append(...cardsCoctail);

  modalController({
    modal: '.modal-make-your-own',
    btnOpen: '.cocktail__btn-make',
  });

  modalController({
    modal: '.modal-add',
    btnOpen: '.cocktail__btn-add',
  });
};
init();
