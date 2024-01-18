const API_URL = 'https://chain-perpetual-chord.glitch.me/';

const price = {
  Клубника: 60,
  Банан: 50,
  Манго: 70,
  Киви: 55,
  Маракуйя: 90,
  Яблоко: 45,
  Мята: 50,
  Лед: 10,
  Биоразлагаемый: 20,
  Пластиковый: 0,
};

const cartDataControl = {
  getLocalStorage() {
    return JSON.parse(localStorage.getItem('freshyBarCard') || '[]');
  },
  addLocalStorage(item) {
    const cartData = this.getLocalStorage();
    item.idls = Math.random().toString(36).substring(2, 8);
    cartData.push(item);
    localStorage.setItem('freshyBarCard', JSON.stringify(cartData));
  },
  removeLocalStorage(idls) {
    const cartData = this.get();
    const index = cart.findIndex(item => item.idls === idls);
    if (index !== -1) {
      cartData.splice(index, 1);
    }
    localStorage.setItem('freshyBarCard', JSON.stringify(cartData));
  },
  clearLocalStorage() {
    localStorage.removeItem('freshyBarCard');
  },
};

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

const modalController = ({ modal, btnOpen, time = 300, open, close }) => {
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

    if (event === 'close' || target === modalElem || code === 'Escape') {
      modalElem.style.opacity = 0;

      setTimeout(() => {
        modalElem.style.visibility = 'hidden';
        scrollService.enabledScroll();

        if (close) {
          close();
        }
      }, time);

      window.removeEventListener('keydown', closeModal);
    }
  };

  const openModal = e => {
    if (open) {
      open({ btn: e.target });
    }
    modalElem.style.visibility = 'visible';
    modalElem.style.opacity = 1;
    window.addEventListener('keydown', closeModal);
    scrollService.disabledScroll;
  };

  buttonElems.forEach(buttonElem => {
    buttonElem.addEventListener('click', openModal);
  });

  modalElem.addEventListener('click', closeModal);

  modalElem.closeModal = closeModal;
  modalElem.openModal = openModal;

  return { openModal, closeModal };
};

const getFormData = form => {
  const formData = new FormData(form);
  const data = {};
  for (const [name, value] of formData.entries()) {
    if (data[name]) {
      if (!Array.isArray(data[name])) {
        data[name] = [data[name]];
      }
      data[name].push(value);
    } else {
      data[name] = value;
    }
  }
  return data;
};

const calculateTotalPrice = (form, startPrice) => {
  let totalPrice = startPrice;

  const data = getFormData(form);

  if (Array.isArray(data.ingredients)) {
    data.ingredients.forEach(item => {
      totalPrice += price[item] || 0;
    });
  } else {
    totalPrice += price[data.ingredients] || 0;
  }

  if (Array.isArray(data.topping)) {
    data.topping.forEach(item => {
      totalPrice += price[item] || 0;
    });
  } else {
    totalPrice += price[data.topping] || 0;
  }

  totalPrice += price[data.cup] || 0;

  return totalPrice;
};

const formControl = (form, cb) => {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = getFormData(form);
    cartDataControl.addLocalStorage(data);

    if (cb) {
      cb();
    }
  });
};

const calculateMakeYourOwn = () => {
  const modalMakeOwn = document.querySelector('.modal-make-your-own');
  const formMakeOwn = modalMakeOwn.querySelector('.make__form-make-your-own');
  const makeInputPrice = modalMakeOwn.querySelector('.make__input-price');
  const makeTotalPrice = modalMakeOwn.querySelector('.make__total-price');
  const makeInputTitle = modalMakeOwn.querySelector('.make__input-title');
  const makeAddBtn = modalMakeOwn.querySelector('.make__add-btn');

  const handlerChange = () => {
    const totalPrice = calculateTotalPrice(formMakeOwn, 0);

    const data = getFormData(formMakeOwn);

    if (data.ingredients) {
      const ingredients = Array.isArray(data.ingredients)
        ? data.ingredients.join(', ')
        : data.ingredients;

      makeInputTitle.value = `Конструктор: ${ingredients}`;
      makeAddBtn.disabled = false;
    } else {
      makeAddBtn.disabled = true;
    }

    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  };

  formMakeOwn.addEventListener('change', handlerChange);
  formControl(formMakeOwn, () => {
    modalMakeOwn.closeModal('close');
  });
  handlerChange();

  const resetForm = () => {
    makeTotalPrice.textContent = '';
    makeAddBtn.disabled = true;
    formMakeOwn.reset();
  };
  return { resetForm };
};

const calculateAdd = () => {
  const modalAdd = document.querySelector('.modal-add');
  const formAdd = document.querySelector('.make__form-add');
  const makeInputSize = modalAdd.querySelector('.make__input-size');
  const makeTotalSize = modalAdd.querySelector('.make__total-size');
  const makeInputPrice = modalAdd.querySelector('.make__input-price');
  const makeTotalPrice = modalAdd.querySelector('.make__total-price');
  const makeTitle = modalAdd.querySelector('.make__title');
  const makeInputTitle = modalAdd.querySelector('.make__input-title');
  const makeInputStartPrice = modalAdd.querySelector(
    '.make__input-start-price',
  );

  const hendlerChange = () => {
    const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value);
    makeInputPrice.value = totalPrice;
    makeTotalPrice.textContent = `${totalPrice} ₽`;
  };

  formAdd.addEventListener('change', hendlerChange);
  formControl(formAdd, () => {
    modalAdd.closeModal('close');
  });

  const fillInForm = data => {
    makeTitle.textContent = data.title;
    makeInputTitle.value = data.title;
    makeInputSize.value = data.size;
    makeTotalSize.textContent = data.size;
    makeInputStartPrice.value = data.price;
    makeInputPrice.value = data.price;
    makeTotalPrice.textContent = `${data.price} ₽`;

    hendlerChange();
  };

  const resetForm = () => {
    makeTotalSize.textContent = '';
    makeTitle.textContent = '';
    makeTotalPrice.textContent = '';
    formAdd.reset();
  };

  return { fillInForm, resetForm };
};

const createCartItem = item => {
  const li = document.createElement('li');
  li.classList.add('order__item');
  li.innerHTML = `
  <img class="order__img"
        src="img/mango.jpg"
         alt="${item.title}"
/>

<div class="order__info">
  <h3 class="order__name">${item.title}</h3>

  <ul class="order__topping-list">
    <li class="order__topping-item">${item.size}</li>
    <li class="order__topping-item">${item.cup}</li>
    ${
      item.topping
        ? Array.isArray(item.topping)
          ? item.topping.map(
              topping => `<li class="order__topping-item">${item.topping}</li>`,
            )
          : `<li class="order__topping-item">${item.topping}</li>`
        : ''
    }
    
  </ul>
</div>

<button
  class="order__item-delete" data-idls="${item.idls}"
  aria-label="Удалить коктейль из корзины"
></button>

<p class="order__item-price">${item.price}&nbsp;₽</p>
`;

  return li;
};

const renderCart = () => {
  const modalOrder = document.querySelector('.modal-order');
  const orderCount = modalOrder.querySelector('.order__count');
  const orderList = modalOrder.querySelector('.order__list');
  const orderPriceTotal = modalOrder.querySelector('.order__price-total');
  const orderForm = modalOrder.querySelector('.order__form');

  const orderListData = cartDataControl.getLocalStorage();

  orderList.textContent = '';
  orderCount.textContent = `(${orderListData.length})`;

  orderListData.forEach(item => {
    orderList.append(createCartItem(item));
  });

  orderPriceTotal.textContent = `${orderListData.reduce(
    (acc, item) => acc + +item.price,
    0,
  )} ₽`;

  orderForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!orderListData.length) {
      alert('Корзина пустая');
      orderForm.reset();
      modalOrder.closeModal('close');
      return;
    }

    const data = getFormData(orderForm);
    const responce = await fetch(`${API_URL}api/order`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        products: orderListData,
      }),
      headers: {
        'Content-Type': 'aplication/json',
      },
    });

    const { message } = await responce.json();
    alert(message);
    cartDataControl.clearLocalStorage();
    orderForm.reset();
    modalOrder.closeModal('close');
  });
};

const init = async () => {
  modalController({
    modal: '.modal-order',
    btnOpen: '.header__btn-order',
    open: renderCart,
  });

  const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwn();

  modalController({
    modal: '.modal-make-your-own',
    btnOpen: '.cocktail__btn-make',
    close: resetFormMakeYourOwn,
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

  const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();

  modalController({
    modal: '.modal-add',
    btnOpen: '.cocktail__btn-add',
    open({ btn }) {
      const id = btn.dataset.id;
      const item = data.find(item => item.id.toString() === id);
      fillInFormAdd(item);
    },
    close: resetFormAdd,
  });
};
init();
