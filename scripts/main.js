'use strict';

// ----- HEADER -----

// --- Variables ---
// Buttons in header
const catalogue = document.querySelector('.catalogue');
const favorites = document.querySelector('.favorites');

// Catalogue and Favorites elements
const contentCatalogue = document.querySelector('.content__catalogue');
const contentFavorites = document.querySelector('.content__favorites');

// Modal window and modal image elements
const modalWindow = document.querySelector('.modal');
const modalImage = document.querySelector('.modal__image');

// --- Event Listeners ---
catalogue.addEventListener('click',function () {
    if(contentCatalogue.classList.contains('content--hidden')) {
        contentFavorites.classList.toggle('content--hidden', true);
    }
    contentCatalogue.classList.toggle('content--hidden');
});

favorites.addEventListener('click', function () {
    if(contentFavorites.classList.contains('content--hidden')) {
        contentCatalogue.classList.toggle('content--hidden', true);
    }
    fillFav();
    contentFavorites.classList.toggle('content--hidden');
});
// ---------------------------------------------------------------------------------------------------------------------


// ----- MAIN -----

// --- Functions ---

// Creation of level of cascading list
function createLevel(parent, objects, type, ...modifiers) {
    let level = [];
    let list = document.createElement('ul');
    let listElement;

    list.classList.add('list', 'content__list');
    if(modifiers[0]) {
        modifiers.forEach(mod => list.classList.add(`list--${mod}`));
    }
    parent[0].appendChild(list);

    objects.forEach(object => {
        if(object.name !== undefined){
            listElement = createListElement(list, object, type);
            level.push(listElement);
        } else {
            let parentId = object.userId !== undefined ? object.userId : object.albumId;
            if(parent[1] === parentId){
                listElement = createListElement(list, object, type);
                level.push(listElement);
            }
        }
    });

    return level;
}
// ---------------------------------------------------------------------------------------------------------------------

// Creation of list element (text or image)
function createListElement(parent, object, type) {
    let elem = document.createElement('li');
    elem.classList.add('list__element');
    parent.appendChild(elem);
    let text = object.name ? object.name : object.title;
    let item;

    if(type === 'text'){
        item = document.createElement('span');
        item.classList.add('list__text');
        item.textContent = text;
        elem.appendChild(item);
    } else if(type === 'image'){
        if(parent === contentFavorites.firstElementChild){
            let span = document.createElement('span');
            span.classList.add('list__title');
            span.textContent = text;
            elem.appendChild(span);
        }
        let star = document.createElement('div');
        star.classList.add('list__star');
        star.dataset.id = object.id;
        if(localStorage.getItem(`${object.id}`) !== null){
            star.classList.add('list__star--active');
        }
        elem.appendChild(star);
        star.addEventListener('click', function () {
            if(localStorage.getItem(`${object.id}`) === null) {
                localStorage.setItem(`${object.id}`, `${JSON.stringify(object)}`);
                star.classList.add('list__star--active');
            } else {
                let starCatalogueElement = document.querySelectorAll(`[data-id="${object.id}"]`);
                localStorage.removeItem(`${object.id}`);
                star.classList.remove('list__star--active');
                starCatalogueElement[0].classList.remove('list__star--active');
                fillFav();
            }
        });

        item = document.createElement('img');
        item.classList.add('list__image');
        item.src = object.thumbnailUrl;
        item.title = object.title;
        item.addEventListener('click', function (e){
            if(e.target.contains(item)){
                modalImage.src = object.url;
                modalWindow.classList.remove('modal--hidden');
                modalImage.addEventListener('click', function (e) {
                    if(e.target.contains(modalImage)){
                        modalWindow.classList.add('modal--hidden');
                        modalImage.src = "";
                    }
                });
            };
        });
        elem.appendChild(item);
    }

    return [elem, object.id];
}
// ---------------------------------------------------------------------------------------------------------------------

// --- Filling content of Favorites ---
function fillFav(){
    if(contentFavorites.firstElementChild !== null) {
        contentFavorites.removeChild(contentFavorites.firstElementChild);
    }

    if(contentFavorites.firstElementChild === null) {
        let list = document.createElement('ul');
        contentFavorites.appendChild(list);
    }

    if (localStorage.length) {
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            let favObject = JSON.parse(localStorage.getItem(key));
            let favItem = createListElement(contentFavorites.firstElementChild, favObject, 'image');
            favItem.src = favObject.thumbnailUrl;
        }
    }
}
// ---------------------------------------------------------------------------------------------------------------------

// --- Variables ---
let urls = [
    "users/",
    "albums/",
];
let resp = [];
let requests = urls.map(url => fetch(`https://json.medrating.org/${url}`)
    .then(responce => responce.json()));
let usersLevel = [];
let albumsLevel = [];
let photoslevel = [];

// --- Filling content of Catalogue ---
requests[0].then(users => {
    usersLevel = createLevel([contentCatalogue, 0], users, 'text');

    requests[1].then(albums => {
        usersLevel.forEach(userElement => {
            albumsLevel = createLevel(userElement, albums, 'text', 'hidden');
            userElement[0].addEventListener('click', function (e) {
                if(e.target.contains(userElement[0].firstElementChild)) {
                    userElement[0].lastElementChild.classList.toggle('list--hidden');
                    userElement[0].firstElementChild.classList.toggle('active');
                };
            });

            albumsLevel.forEach(albumElement => {
                albumElement[0].addEventListener('click', function (e) {
                    fetch(`https://json.medrating.org/photos?albumId=${albumElement[1]}`)
                    .then(responce => responce.json())
                    .then(photos => {
                        if(albumElement[0].lastElementChild.tagName !== "UL"){
                            photoslevel = createLevel(albumElement, photos, 'image', 'hidden');
                        }

                        if(e.target.contains(albumElement[0].firstElementChild)) {
                            albumElement[0].lastElementChild.classList.toggle('list--hidden');
                            albumElement[0].firstElementChild.classList.toggle('active');
                        };
                    });
                });
            });
        });
    });
});
// ---------------------------------------------------------------------------------------------------------------------