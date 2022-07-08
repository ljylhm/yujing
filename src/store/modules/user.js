/**
 * @author https://gitee.com/chu1204505056/vue-admin-better （不想保留author可删除）
 * @description 登录、获取用户信息、退出登录、清除accessToken逻辑，不建议修改
 */

import Vue from 'vue'
import { getUserInfo, login, logout } from '@/api/user'
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/utils/accessToken'
import { resetRouter } from '@/router'
import { title, tokenName } from '@/config'

const state = () => ({
  accessToken: getAccessToken(),
  username: '',
  avatar: '',
  permissions: [],
  isAdmin: false
})
const getters = {
  accessToken: (state) => state.accessToken,
  username: (state) => state.username,
  avatar: (state) => state.avatar,
  permissions: (state) => state.permissions,
  isAdmin: (state) => state.isAdmin,
}
const mutations = {
  setAccessToken(state, accessToken) {
    state.accessToken = accessToken
    setAccessToken(accessToken)
  },
  setUsername(state, username) {
    state.username = username
  },
  setAvatar(state, avatar) {
    state.avatar = avatar
  },
  setUserStatus(state, status){
    state.isAdmin = status
  },
  setPermissions(state, permissions) {
    state.permissions = permissions
  },
}
const actions = {
  setPermissions({ commit }, permissions) {
    commit('setPermissions', permissions)
  },
  async login({ commit }, userInfo) {
    const { data } = await login(userInfo)
    const accessToken = data['token']
    if (accessToken) {
      commit('setAccessToken', accessToken)
      const hour = new Date().getHours()
      const thisTime =
        hour < 8
          ? '早上好'
          : hour <= 11
          ? '上午好'
          : hour <= 13
          ? '中午好'
          : hour < 18
          ? '下午好'
          : '晚上好'
      Vue.prototype.$baseNotify(`欢迎登录${title}`, `${thisTime}！`)
    } else {
      Vue.prototype.$baseMessage(
        `登录接口异常，未正确返回${tokenName}...`,
        'error'
      )
    }
  },
  async getUserInfo({ commit, state }) {
    const { data } = await getUserInfo(state.accessToken)
    const { name, is_admin } = data
    commit('setUsername', name)
    commit('setAvatar', "https://avatars.githubusercontent.com/u/36689704?s=50")
    commit('setUserStatus', is_admin == 1)
  },
  async logout({ dispatch }) {
    // await logout(state.accessToken)
    await dispatch('resetAccessToken')
    await resetRouter()
  },
  resetAccessToken({ commit }) {
    commit('setPermissions', [])
    commit('setAccessToken', '')
    removeAccessToken()
  },
}
export default { state, getters, mutations, actions }
