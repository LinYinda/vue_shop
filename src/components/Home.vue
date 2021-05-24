<template>
    <el-container class="home_container">
        <!--头部-->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="黑马">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout" >退出</el-button>
        </el-header>
        <el-container>
            <!--侧边栏-->
            <el-aside :width="isCollapse?'64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409bff" 
                unique-opened :collapse="isCollapse" :collapse-transition="false" router 
                :default-active="activePath">
                    <!--index只能字符串，所以加个空字符直接变成字符串-->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
                        <template slot="title">
                            <i :class="iconsObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" 
                        :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
            </el-menu>

            </el-aside>
            <!--主部-->
            <el-main>
                <!--路由占位符-->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            //左侧菜单
            menulist:[],
            iconsObj:{
                '125':'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            isCollapse:false,
            //被激活的链接
            activePath:''
        }
    },
    created(){
        this.getMenuList();
        //初次绑定activePath
        this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods:{
        //退出登录
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        //获取菜单栏
        async getMenuList(){
            const{data:res} = await this.$http.get('menus');
            
            if(res.meta.status != 200) return this.$message.error(res.meta.msg);
            this.menulist = res.data;
        },
        //切换菜单的折叠与展开
        toggleCollapse(){
            this.isCollapse = !this.isCollapse;
        },
        //保存nav
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath',activePath);
            //每次子页调用还要改activePath
            this.activePath = activePath;
        }
    }
}
</script>
<style scoped>
.el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color:#fff;
    font-size: 20px;
}
.el-header div {
    display: flex;
    align-items: center;
}
.el-header div span{
    margin-left: 15px;
}
.el-aside{
    background-color: #333744;
}
.el-aside .el-menu{
    border-right: none;
}
.el-aside .toggle-button{
    background-color:#4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
    
}
.el-main{
    background-color: #EAEDF1;
}
.home_container{
    height: 100%;
}
.iconfont{
    margin-right: 10px;
}
</style>
