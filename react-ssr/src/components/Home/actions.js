import { getList } from '../../api/home';
import { ACTION_HOME } from './contants';

const createAction = (type, data, currentPage = 1) => {
  return { type, payload: data, currentPage};
};

// redux-thunk支持action为函数的dispatch
export const getHomeListData = function(currentPage) {
  return (dispatch) => {
    getList(currentPage).then(res => {
      const { result } = res.data || {};
      const data = (result || []).map(item => {
        return {
          sid: item.sid,
          title: item.text
        };
      })
      const action = createAction(ACTION_HOME.LIST_DATA, data, currentPage);
      dispatch(action);
    });
  };
}

export const homeLoadData = function(store) {
  const action = getHomeListData();
  store.dispatch(action);
};
