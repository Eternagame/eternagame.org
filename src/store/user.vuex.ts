/* eslint-disable max-classes-per-file */
import { createModule, mutation, action } from 'vuex-class-component';
import axios, { AxiosInstance } from 'axios';
import { RefreshAchievement, UserData } from '@/types/common-types';

const VuexModule = createModule({
  strict: false,
});

// export default class UserStore extends VuexModule {
export default function createUserStore($http: AxiosInstance) {
  class UserStore extends VuexModule {
    public username: string | null = null;

    public uid: number | null = null;

    public loggedIn = false;

    public showSidebar = false;

    // TODO https://github.com/eternagame/eternagame.org/issues/17 improve typing
    public FB: any = null;

    public hasLabAccess: boolean = false;

    public userDetails: UserData | null = null;

    public triedAuthenticating = false;

    public promptSignAgreement = false;

    public newAchievements: RefreshAchievement[] = [];
    
    @mutation showResetCompleteModal() {}

    @action() async logout() {
      this.loggedIn = false;
      const response = await $http.get('/eterna_logout.php');
      window.localStorage.setItem('loggedIn', 'false');
      this.triedAuthenticating = false;
      await this.FB?.logout();
    }

    @action() async fbLogin(FB: any) {
      this.FB = FB;
      const { data } = (
        await $http.post('/login/', new URLSearchParams({ type: 'login', method: 'facebook' }))
      ).data;
      if (data.success) {
        this.loggedIn = true;
        window.localStorage.setItem('loggedIn', 'true');
      }
      await this.authenticate();
      return data;
    }

    @action() async login({ username, password }: { username: string; password: string }) {
      const loginParams = {
        name: username,
        pass: password,
        type: 'login',
        workbranch: 'localhost:8080',
      };

      const { data, new_achievements } = (await $http.post('/login/', new URLSearchParams(loginParams))).data;
      if (data.success) {
        this.loggedIn = true;
        window.localStorage.setItem('loggedIn', 'true');
      }
      await this.authenticate();
      this.pushAchievements(new_achievements);
      return data;
    }

    /** Authenticates the logged-in player. */
    @action() async authenticate(): Promise<any> {
      this.triedAuthenticating = true;
      const response = await $http.get('/eterna_authenticate.php');
      const { data } = response;
      if (data === 'NOT LOGGED IN') {
        this.loggedIn = false;
        this.username = 'Anonymous';
        this.uid = 0;
        return;
      }
      const matches = data.match(/^(.+)\s(\d+)$/);
      if (matches && matches.length === 3) {
        const [match, username, uid] = matches;
        this.username = username;
        this.uid = Number(uid);
        this.loggedIn = true;
        const userDataResponse = (await axios.get(`/get/?type=my_user&uid=${uid}`)).data.data;
        this.userDetails = userDataResponse.user;
        this.hasLabAccess = Boolean(
          Number((this.userDetails as UserData).ten_tools_level) >= 8 ||
            Number((this.userDetails as UserData).is_lab_member_legacy),
        );
      } else {
        throw new Error(`Authentication response malformed: ${data}`);
        // TODO: is throw the right action?
      }
    }

    @action async refreshAchievements() {
      const res = await $http.post('/post/', new URLSearchParams({ type: 'refresh_achievements'}));
      const {new_achievements} = res.data;
      this.pushAchievements(new_achievements);
    }

    @mutation private pushAchievements(achievements?: Record<string, RefreshAchievement>) {
      if (achievements) this.newAchievements.push(...Object.entries(achievements).map(([key, val]) => val));
    }
  }

  return UserStore;
}
