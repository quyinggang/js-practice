import { ACTION_HOME } from './contants';

const defaultState = {
  currentPage: 1,
  listData: [],
};

const homeReducer = function(state = defaultState, action) {
  let newState = { ...state };
  switch(action.type) {
    case ACTION_HOME.LIST_DATA:
      newState = {
        ...state,
        listData: action.payload,
        currentPage: action.currentPage
      };
      break;
  }
  return newState;
};

export default {
  home: homeReducer
};