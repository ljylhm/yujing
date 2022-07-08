<template>
  <div class="index-container">
    <div class="index-nav">
      <el-menu class="el-menu-demo" mode="horizontal">
        <el-menu-item index="1"><a href="/" target="_self">首页</a></el-menu-item>
      </el-menu>
    </div>
    <div class="index-bg-container">
      <div class="cover-filter"></div>
    </div>
    <div class="index-footer">
      <p>上海豫璟教育科技有限公司</p>
      <p>Copyright © 2022</p>
       <a href="/#/user" class=" icon">
         <i class=" el-icon-right"></i>
       </a>
    </div>
  </div>
</template>

<script>
  import VabChart from '@/plugins/echarts'
  import { dependencies, devDependencies } from '../../../package.json'
  import { getList } from '@/api/changeLog'
  import { getNoticeList } from '@/api/notice'
  import { getRepos, getStargazers } from '@/api/github'
  import Plan from './components/Plan'
  import VersionInformation from './components/VersionInformation'

  export default {
    name: 'Index',
    components: {
      VabChart,
      Plan,
      VersionInformation,
    },
    data() {
     return {

     }
    },
    created() {
      
    },
    beforeDestroy() {
     
    },
    mounted() {},
    methods: {}
  }
</script>
<style lang="scss" scoped>

.index-bg-container{
    padding: 0 !important;
    margin: 0 !important;
    // width: 100vw;
    height: 100vh;
    position: relative;
    // background: url("../../assets/index-bg.jpg") no-repeat center center;
    background: url("https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fihuawen.com%2Fdata%2Fupload%2Fueditor%2F20200911%2F5f5b4625e241b.jpg&refer=http%3A%2F%2Fihuawen.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1659189061&t=91a790ff66d6b72b755b166a70554f6b") no-repeat center center;
    background-size: cover;
    // filter: opacity(60%);
}
.cover-filter{
  width: 100%;
  height: 100%;
  background: rgba($color: #000000, $alpha: 0.2);
}
.index-container {
   
}

.index-nav{
    width: 100%;
    background: #fff;
    display: flex;
    justify-content: flex-end;
}

.index-footer{
  width: 100%;
  // color: hsla(0,0%,100%,.8);
  // background: #313438;
  color: #000000;
  padding: 20px 0px;
  text-align: center;
  position: relative;
}

.icon{
  position: absolute;
  bottom: 10px;
  right: 10px;
}
.icon:hover{
  cursor: pointer;
}
</style>
