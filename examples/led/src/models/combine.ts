import { combineReducers } from 'redux';
import { combineEpics } from 'redux-observable';
import { reducers as commonReducers, epics as commonEpics } from './modules/common';
import { reducers as productReducers } from './modules/product';

export const reducers = {
  ...commonReducers,
  ...productReducers,
};

type Reducers = typeof reducers;

export type ReduxState = { [K in keyof Reducers]: ReturnType<Reducers[K]> };

export const rootReducers = combineReducers(reducers);

const allEpics = [...commonEpics];

export const rootEpics = combineEpics(...allEpics);
