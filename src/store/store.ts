import Vue from 'vue';
import Vuex from 'vuex';
import { extractVuexModule, createProxy } from 'vuex-class-component';
import { AxiosInstance } from 'axios';
import createUserStore from './user.vuex';
import createMobilStore from './mobile.vuex';
import createFetchDataStore from './FetchData.vuex';
import PaginationStore from './pagination.vuex';

Vue.use(Vuex);

export default function createStore(axios: AxiosInstance) {
  const BoundUserStore = createUserStore(axios);
  const BoundPaginationStore = PaginationStore;
  const BoundMobileStore = createMobilStore();
  const BoundFetchDataStore = createFetchDataStore();

  const store = new Vuex.Store({
    modules: {
      ...extractVuexModule(BoundUserStore),
      ...extractVuexModule(BoundMobileStore),
      ...extractVuexModule(BoundPaginationStore),
      ...extractVuexModule(BoundFetchDataStore),
    },
  });

  const vxm = {
    user: createProxy(store, BoundUserStore),
    mobile: createProxy(store, BoundMobileStore),
    pagination: createProxy(store, BoundPaginationStore),
    fetchData: createProxy(store, BoundFetchDataStore),
  };

  return {
    store,
    vxm,
  };
}
