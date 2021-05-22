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
            <el-aside width="200px">
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b">
                    <el-submenu index="1">
                        <template slot="title">
                            <i class="el-icon-location"></i>
                            <span>导航一</span>
                        </template>
                        <el-menu-item index="1-3">
                            <template slot="title">
                                <i class="el-icon-location"></i>
                                <span>导航二</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
            </el-menu>

            </el-aside>
            <!--主部-->
            <el-main>Main</el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            //左侧菜单
            menulist:[],
        }
    },
    created(){
        this.getMenuList();
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
            console.log(this.menulist);
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
.el-main{
    background-color: #EAEDF1;
}
.home_container{
    height: 100%;
}
</style>
