let idProfile = '';

class Api{
  constructor(options) {
    /* Можно лучше: адрес сервера и ключ авторизации нужно передавать через параметр конструктора options  */
    this.baseUrl = 'http://95.216.175.5/cohort5';
    this.token = '764b7d37-6c81-493b-bddf-01325b213ef0';
  }

  getInitialCards(doFunction) {
    this.fetchData(`${this.baseUrl}/cards`, "GET", doFunction);
  }

  getProfile(doFunction) {
    this.fetchData(`${this.baseUrl}/users/me`, "GET", doFunction);
  }  

  like(id, doFunction) {
    this.fetchData(`${this.baseUrl}/cards/like/${id}`, "PUT", doFunction);
  }

  dislike(id, doFunction) {
    this.fetchData(`${this.baseUrl}/cards/like/${id}`, "DELETE", doFunction);
  }

  createCard(body, doFunction){
    this.postData(`${this.baseUrl}/cards`, 'POST', body, doFunction);
  }

  updateProfil(body, doFunction){
    this.postData(`${this.baseUrl}/users/me`, 'PATCH', body, doFunction);
  }

  updateAvatar(body, doFunction){
    this.postData(`${this.baseUrl}/users/me/avatar`, 'PATCH', body, doFunction);
  }

  fetchData(url, method, doFunction) {
    fetch(url, {
      method: method,
      headers: {
        authorization: this.token
      }
    }).then(res => { 
    /*
      Можно лучше: проверка ответа сервера и преобразование из json
      дублируется, лучше вынести в отдельный метод:
      getResponseData(res) {
        if (res.ok) {
          return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      }
    */
      if(res.ok) { 
        return res.json() 
      }
      return Promise.reject(`Что-то пошло не так: ${res.status}`); 
    }).then((res) => {
        doFunction(res);
    }).catch((error) => {
        console.log(error);
    });    
  }

  postData(url, metod, body, doFunction){
    fetch(url, {
      method: metod,
      headers: {
          authorization: this.token,
          'Content-Type': 'application/json'
      },
      body: body
    })  
      .then(res => {
        if (res.ok) {
          return res.json();
        }
          return Promise.reject(`Что-то пошло не так: ${res.status}`); 
      })
      .then((result) => {
        doFunction(result);
      })
      .catch(error => {
        console.log(error);
      })
  }

  deleteCard(id, doFunction){
    this.fetchData(`${this.baseUrl}/cards/${id}`, 'DELETE', doFunction);
  }
}

const api = new Api();


class Profile{
    constructor(name, job, avatar, id){
      this.userInfoFoto = document.querySelector('.user-info__photo');
      this.userName = document.querySelector('.user-info__name');
      this.userJob = document.querySelector('.user-info__job');
      this.author = id;
      this.name = name;
      this.job = job;
      this.avatar = avatar;
    }

    update(){
      this.userName.textContent = this.name;
      this.userJob.textContent = this.job;
      this.userInfoFoto.style.backgroundImage = `url(${this.avatar})`;
    }
}

class CardList{
    constructor(placesList, popup){
      this.container = placesList;
      this.popup = popup;
    }

    addCard(item, curentUserId, api) {
      const card = new Card(item, api);
      card.render(this.popup.open.bind(this.popup), curentUserId);
      this.container.appendChild(card.cardElement);
    }
}

class Card {
    constructor(item, api){
      this.name = item.name;
      this.link = item.link;
      this.id = item._id;
      this.likes = item.likes;
      this.author = item.owner._id;
      this.api = api;
    }

    render(popup, curentUserId){
      this.cardElement = this.createCard(this.name, this.link, curentUserId);
      if (curentUserId == this.author){
      this.cardElement.querySelector('.place-card__delete-icon')
             .addEventListener('click', this.remove.bind(this));
      }
      this.cardElement.querySelector('.place-card__like-icon')
              .addEventListener('click', this.like.bind(this));
      this.cardElement.querySelector('.place-card__image')
              .addEventListener('click', popup);
    }

    like(event){
      let count = this.cardElement.querySelector('.place-card__like-count');
      if (event.target.classList.contains('place-card__like-icon_liked')){
        this.api.dislike(this.id, (res) => {
          this.likes = res.likes;
          event.target.classList.toggle('place-card__like-icon_liked');
          count.textContent = this.likes.length;
        })
      } else {
        this.api.like(this.id, (res) => {
          this.likes = res.likes;
          event.target.classList.toggle('place-card__like-icon_liked');
          count.textContent = this.likes.length;
        });
      }
    }

    remove(event){
      event.stopPropagation();
      if (window.confirm('Вы действительно хотите удалить эту карточку?')) {
        this.api.deleteCard(this.id, (res) => {
          this.cardElement.remove();
        });
      }
    }

    createCard(nameValue, linkValue, curentUserId){
      const placeCard = document.createElement('div');
      placeCard.classList.add('place-card');
      
      const placeCardImage = document.createElement('div');
      placeCardImage.classList.add('place-card__image');
      placeCardImage.style.backgroundImage = `url(${linkValue})`;

      const placeCardDescription = document.createElement('div');
      placeCardDescription.classList.add('place-card__description');
      
      const placeCardName = document.createElement('h3');
      placeCardName.classList.add('place-card__name');
      placeCardName.textContent = nameValue;

      const likeContent = document.createElement('div');
      likeContent.classList.add('place-card__like-content');
      
      const placeCardLikeButton = document.createElement('button');
      placeCardLikeButton.classList.add('place-card__like-icon');

      for (let i = 0; i < this.likes.length; ++i) {
        if(this.likes[i]._id == curentUserId) {
          placeCardLikeButton.classList.add('place-card__like-icon_liked');
          break;
        }
      }

      const likeCount = document.createElement('div');
      likeCount.classList.add('place-card__like-count');
      likeCount.textContent = this.likes.length;


      if (curentUserId == this.author){
        const placeCardDeleteButton = document.createElement('button');
        placeCardDeleteButton.classList.add('place-card__delete-icon');
        placeCardImage.appendChild(placeCardDeleteButton);
      }

      placeCard.appendChild(placeCardImage);
      placeCard.appendChild(placeCardDescription);
      placeCardDescription.appendChild(placeCardName);

      likeContent.appendChild(placeCardLikeButton);
      likeContent.appendChild(likeCount);
      
      placeCardDescription.appendChild(likeContent);

      return placeCard;

    }
}

class Popup{
  constructor(popup){
    this.popup = popup;
    this.popup.querySelector('.popup__close').addEventListener('click', this.close.bind(this))
  }

  open(){
    this.popup.classList.add('popup_is-opened');
  }

  close(){
    this.popup.classList.remove('popup_is-opened');
  }
}

class PopupShowCard extends Popup{
  open(event) {
      const showBigPopupImage = this.popup.querySelector('.showBigPopup__image');
      showBigPopupImage.src = event.target.style.backgroundImage.slice(5, -2);
      super.open();
  }
}

class PopupForm extends Popup{
  constructor(popup, api){
    super(popup);
    this.api = api;
    this.form = popup.querySelector('form');
  }

  eventListenerSubmit(submit){
    this.form.addEventListener('submit', submit.bind(this));
  }

  eventListenerInput(render){
    this.form.addEventListener('input', render.bind(this));
  }

  enableButton(){
    let button = this.form.querySelector('.popup__button');
    button.classList.add('popup__button_enable');
    button.removeAttribute('disabled');
  }
  
  disabeButton(){
    let button = this.form.querySelector('.popup__button');
    button.classList.remove('popup__button_enable');
    button.setAttribute('disabled', true);
  }  

  close(){
    super.close();
    this.form.reset();
    this.disabeButton();
  }
}

class PopupNewCard extends PopupForm{
  constructor(popup, placesList, curentUserId, api){
    super(popup, api);
    this.nameComment = this.popup.querySelector('.popup__input_type_name-comment');
    this.linkComment = this.popup.querySelector('.popup__input_type_link-url-comment');
    this.placesList = placesList;
    this.name = this.form.elements.name;
    this.link = this.form.elements.link;
    this.curentUserId = curentUserId;
  }

  submit(event){
    event.preventDefault();
    this.form.elements.add.textContent = 'Загрузка...';
    this.disabeButton();
    let body = JSON.stringify({
      name: this.name.value,
      link: this.link.value
    });
    this.api.createCard(body, (result) => {
      this.placesList.addCard(result, this.curentUserId, api);
      this.form.reset(); 
      this.close();

      /* Можно лучше: менять состояние кнопки следует в блоке finally который выполнится
      в любом случае - была ошибка при запросе или нет 
      https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally  */
      this.form.elements.add.textContent = '+';
    });
  }

  validate(){
    let isValid = false;

    if (!this.name.value.length){
      this.nameComment.textContent = "Это обязательное поле"
      isValid = false;
    } else if (this.name.value.length < 2 || this.name.value.length > 30){
      this.nameComment.textContent = "Должно быть от 2 до 30 символов"
      isValid = false;
    } else {
      this.nameComment.textContent = "\u00a0";
      isValid = true;
    }
    if (!this.link.value.length){
      this.linkComment.textContent = "Это обязательное поле"
      isValid = false;
    } else if (!this.link.value.startsWith('https:')){
      this.linkComment.textContent = "Здесь должна быть ссылка"
      isValid = false;
    } else {
      this.linkComment.textContent = "\u00a0";
      isValid = true & isValid;
    }
    return isValid;
  }

  render(){
    if (this.validate()){
      this.enableButton();
    } else {
      this.disabeButton();
    }
  }

  close(){
    super.close();
    this.nameComment.textContent = "\u00a0";
    this.linkComment.textContent = "\u00a0";
  }
}

class PopupEditProfile extends PopupForm{
  constructor(popup, profile, api){
    super(popup, api);
    this.inputNameComment = this.popup.querySelector('.popup__input_type_name-edit-comment');
    this.inputAboutComment = this.popup.querySelector('.popup__input_type_about-edit-comment');
    this.profile = profile;
    this.name = profile.querySelector('.user-info__name');
    this.job = profile.querySelector('.user-info__job');
    this.author = this.form.elements.author;
    this.about = this.form.elements.about;
  }

  submit(event){
    event.preventDefault();
    event.currentTarget.elements.save.textContent = 'Загрузка...';
    this.disabeButton();
    setTimeout(() => {
      let body = JSON.stringify({
        name: this.author.value,
        about: this.about.value
      });
      this.api.updateProfil(body, (result) => {
        new Profile(result.name, result.about, result.avatar, result._id).update();
        this.form.reset();
        this.close();

       /* Можно лучше: менять состояние кнопки следует в блоке finally который выполнится
        в любом случае - была ошибка при запросе или нет 
        https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally  */
        this.form.elements.save.textContent = 'Сохранить';
    })
    }, 500); 
  }

  validate(){ 
    let valid = false;
    if (!this.author.value.length){
      this.inputNameComment.textContent = "Это обязательное поле";
      valid = false;
    } else if (this.author.value.length < 2 || this.author.value.length > 30){
      this.inputNameComment.textContent = "Должно быть от 2 до 30 символов";
      valid = false;
    } else {
      this.inputNameComment.textContent = "\u00a0";
      valid = true;
    }
    if (!this.about.value.length){
      this.inputAboutComment.textContent = "Это обязательное поле";
      valid = false;
    } else if (this.about.value.length < 2 || this.about.value.length > 30){
      this.inputAboutComment.textContent = "Должно быть от 2 до 30 символов";
      valid = false;
    } else {
      this.inputAboutComment.textContent = "\u00a0";
      valid = true & valid;
    }
    return valid;
  }

  render(){
    if (this.validate()){
      this.enableButton();
    } else {
      this.disabeButton();
    }
  }

  open(){
    super.open();
    this.author.value = this.name.textContent;
    this.about.value = this.job.textContent;
    this.render();
  }

  close(){
    super.close();
    this.inputNameComment.textContent = "\u00a0";
    this.inputAboutComment.textContent = "\u00a0";
  }
}

class PopupEditAvatar extends PopupForm{
  constructor(popup, profile, api){
    super(popup, api);
    this.inputAvatar = this.popup.querySelector('.popup__input_type_link-avatar');
    this.inputAvatarCmment = this.popup.querySelector('.popup__input_type_avatar-edit');
    this.profile = profile;
    this.userInfoFoto = profile.querySelector('.user-info__photo');
    this.avatar = '';
  }

  submit(event){
    let body = JSON.stringify({
      avatar: this.inputAvatar.value,
    });
    event.preventDefault();
    this.api.updateAvatar(body, (result) => {
      this.avatar = result.avatar;
      this.update();
      this.form.reset();
      this.close();
    });
  }

  update(){
    this.userInfoFoto.style.backgroundImage = `url(${this.avatar})`;
  }

  validate(){
    let isValid = false;
    if (!this.inputAvatar.value.length){
      this.inputAvatarCmment.textContent = "Это обязательное поле"
      isValid = false;
    } else if (!this.inputAvatar.value.startsWith('https:')){
      this.inputAvatarCmment.textContent = "Здесь должна быть ссылка"
      isValid = false;
    } else {
      this.inputAvatarCmment.textContent = "\u00a0";
      isValid = true;
    }
    return isValid;
  }

  render(){
    if (this.validate()){
      this.enableButton();
    } else {
      this.disabeButton();
    }
  }

  close(){
    super.close();
    this.inputAvatarCmment.textContent = "\u00a0";
  }
}

const profile = document.querySelector('.profile');
const addPopupButton = document.querySelector('.user-info__button');
const userEditButton = document.querySelector('.user_edit')
const popupShowCard = new PopupShowCard(document.querySelector('#foto'));
const placesList = new CardList(document.querySelector('.places-list'), popupShowCard);

const popupProfile = new PopupEditProfile(document.querySelector('#profile'), profile, api);
popupProfile.eventListenerSubmit(popupProfile.submit);
popupProfile.eventListenerInput(popupProfile.render);
userEditButton.addEventListener('click', popupProfile.open.bind(popupProfile));

const popupAvatar = new PopupEditAvatar(document.querySelector('#avatar'), profile, api);
popupAvatar.eventListenerSubmit(popupAvatar.submit);
popupAvatar.eventListenerInput(popupAvatar.render);
popupAvatar.userInfoFoto.addEventListener('click', popupAvatar.open.bind(popupAvatar));


// =================================== API ======================================

api.getProfile((result) => {
  new Profile(result.name, result.about, result.avatar, result._id).update();
  idProfile = result._id;
  
  const popupCard = new PopupNewCard(document.querySelector('#card'), placesList, idProfile, api);
  popupCard.eventListenerSubmit(popupCard.submit);
  popupCard.eventListenerInput(popupCard.render);
  
  addPopupButton.addEventListener('click', popupCard.open.bind(popupCard));
  
  api.getInitialCards((result) => {
    result.forEach(function(item) {
      placesList.addCard(item, idProfile, api);
    });
  })  
});


/*
  Хорошая работа:
  - отлично, что сделано также дополнительное задание
  - есть обработка ошибок в конце цепочки блоков then
  - изменения на странице происходят только после ответа сервера
  - код хорошо организован

  Можно лучше: 
  - менять надпись на кнопке нужно в блоке finally
  - передавать настройки сервера как параметры конструктора, а не хардкодить в самом классе
  - не дублировать проверку ответа сервера

  Так же хочу обратить внимание на альтернативное решение данной задачи. 
  Сейчас для выполнения действий после ответа сервера в метод запроса передается
  колбэк, а можно было все зделать на промисах, их также можно возвращать из метода, вот пример кода:
  Метод getUserData класса Api: 
    getUserData() { //в методе getUserData делаем запрос к серверу и
      return fetch(`${this.baseUrl}/users/me`,{ // <-- возвращаем промис с данными
        headers: this.headers
      })
      .then((res) => {            //в этом методе также обработка ошибок
        if (res.ok) {
            return res.json();
        }
        return Promise.reject(`Ошибка: ${res.status}`);
      })
    }

    Использование метода:
    api.getUserData()
      .then((userData) => {   //обрабатывает возвращенный промис
        ........
      })
      .catch((err) => console.log(err));  // <-- обработка ошибок здесь, в самом конце цепочки then
    }

    Если у Вас будет свободное время попробуйте изучить работу с сервером
    с использованием async/await для работы с асинхронными запросами.
    https://learn.javascript.ru/async-await
    https://habr.com/ru/company/ruvds/blog/414373/
    Это часто используется в реальной работе

    Успехов в дальнейшем обучении!
*/