import { combineReducers } from 'redux';
import homeReducer from '../components/Home/reducer';

export default combineReducers({
  ...homeReducer
});
