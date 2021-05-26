<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图-->
        <el-card>
            <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon> </el-alert>
            <!--选择商品分类-->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader clearable 
                    v-model="selectedCateKeys"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            <!--tab页签区域-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
                    <!--动态参数表格-->
                    <el-table :data="manyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand" >

                        </el-table-column>
                        <!--索引行-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <!--内容行-->
                        <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" >
                            <template >
                                    <el-button type="primary" icon="el-icon-edit" size="mini" >编辑</el-button>
                                    <el-button type="danger" icon="el-icon-delete" size="mini" >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
                    <!--静态属性表格-->
                    <el-table :data="onlyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand" >

                        </el-table-column>
                        <!--索引行-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <!--内容行-->
                        <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" >
                            <template >
                                    <el-button type="primary" icon="el-icon-edit" size="mini" >编辑</el-button>
                                    <el-button type="danger" icon="el-icon-delete" size="mini" >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script>
export default {    
    data(){
        return{
            //商品分类
            catelist:[],
            //级联选择框设置
            cateProps:{ 
                expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children'
             },
             //级联选择框双向绑定选择结果
             selectedCateKeys:[],
            //tab页面激活
            activeName:'many',
            //动态表格和静态表格存储
            manyTableData:[],
            onlyTableData:[],
        }
    },
    created(){
        this.getCateList();
    },
    computed:{
        //如果需要禁用则返回true
        isBtnDisabled(){
            if(this.selectedCateKeys.length !== 3) return true;
            else return false;
        },
        //当前选中三级的ID
        cateId(){
            if(this.selectedCateKeys.length === 3) return this.selectedCateKeys[2];
            return null;
        }
    },
    methods:{
        //获取商品分类
        async getCateList(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！');
            this.catelist = res.data;
            console.log(this.catelist)
        },
        //级联选择框选择变化
        handleChange(){
            this.getParamsData();
        },
        //tab页签点击事件处理
        handleTabClick(){
            this.getParamsData();
        },
        //获取参数列表数据
        async getParamsData(){
            if(this.selectedCateKeys.length !== 3){
                this.selectedCateKeys = [];
                return;
            }
            //根据所选分类ID获取对应参数
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}});
            if(res.meta.status !== 200) return this.$message.error('获取参数列表失败！');
            console.log(res.data);
            if(this.activeName ==='many'){
                this.manyTableData = res.data;
            }
            else this.onlyTableData = res.data;
        }
        
    }
}
</script>

<style scoped>
.cat_opt{
    margin:15px;
}
</style>
