import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeViews.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    // получаем id из адресной строки
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 1. Отметить выбранный результат
    resultsView.update(model.getSearchResultsPage());

    // 2. Обновление закладки
    bookmarksView.update(model.state.bookmarks);

    // 3. Загрузка рецепта
    await model.loadRecipe(id);

    // 4. Рендеринг рецепта
    recipeView.render(model.state.recipe);
    // const recipeView = new recipeView(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
controlRecipes();

const controlSearcResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1. Получить поисковый запрос
    const query = searchView.getQuery();
    if (!query) return;

    // 2. Загрузка результатов поиска
    await model.loadSearchResults(query);

    // 3. Отрисовка результатов
    // Отрисовывались все результаты
    // resultsView.render(model.state.search.results);
    // отрисовывать согласно пагинации
    resultsView.render(model.getSearchResultsPage());

    // 4. Рендер кнопки
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Отрисовка новых результатов
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Отрисовка обновлённых кнопок
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Обновить порции в рецепте (in state)
  model.updateServings(newServings);

  // Обновить внешний вид рецепта
  // recipeView.render(model.state.recipe);
  // метод update обновляет текст и дом, не перерендеривая всю страницу
  recipeView.update(model.state.recipe);
};

const controlAddBookmarg = function () {
  // 1) Добавить или удалить закладку
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  console.log(model.state.recipe);

  // 2) Обновить вид рецепта
  recipeView.update(model.state.recipe);

  // 3) Отрисовать закладки
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Загрузочный спиннер
    addRecipeView.renderSpinner();

    // Загрузка нового рецепта
    await model.uploadRecipe(newRecipe);

    // Рендер рецепта
    recipeView.render(model.state.recipe);

    // Успешно
    addRecipeView.renderMessage();

    // Рендерить вид закладок с загруженным
    bookmarksView.render(model.state.bookmarks);

    // Изменить айди в URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();

    // Закрыть форму
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🎆', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmarg);
  searchView.addHandlerSearch(controlSearcResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
