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
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible= true">添加参数</el-button>
                    <!--动态参数表格-->
                    <el-table :data="manyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand" >
                            <template v-slot="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i">{{item}}</el-tag>
                            </template>
                        </el-table-column>
                        <!--索引行-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <!--内容行-->
                        <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" v-slot="scope">
                            <template >
                                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)" >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible= true">添加属性</el-button>
                    <!--静态属性表格-->
                    <el-table :data="onlyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand" >
                            <template v-slot="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable>{{item}}</el-tag>
                            </template>
                        </el-table-column>
                        <!--索引行-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <!--内容行-->
                        <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" v-slot="scope">
                            <template >
                                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!--添加参数对话框-->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!--修改参数对话框-->
        <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
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
            //添加参数控制属性
            addDialogVisible:false,
            addForm:{
                attr_name:''
            },
            addFormRules:{
                attr_name:[
                    {required:true,message:'请输入参数名称',trigger:'blur' }

                ]
            },
            //修改参数控制属性
            editDialogVisible:false,
            editForm:{
                attr_name:''
            },
            editFormRules:{
                attr_name:[
                    {required:true,message:'请输入参数名称',trigger:'blur' }

                ]
            },

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
        },
        //计算dialog绘制内容
        titleText(){
            if(this.activeName == 'many') return '动态参数';
            else return '静态属性';
        }
    },
    methods:{
        //获取商品分类
        async getCateList(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！');
            this.catelist = res.data;
            
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

            res.data.forEach(item => {
                item.attr_vals =  item.attr_vals ? item.attr_vals.split(' ') : [];
            });
            console.log(res.data);
            if(this.activeName ==='many'){
                this.manyTableData = res.data;
            }
            else this.onlyTableData = res.data;
        },
        //监听关闭dialog重置
        addDialogClosed(){
            this.$refs.addFormRef.resetFields();
        },
        //确认添加参数
         addParams(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return;
                const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{attr_name:this.addForm.attr_name , attr_sel:this.activeName});
                if(res.meta.status !== 201) return this.$message.error('添加参数失败！');
                this.$message.success('添加参数成功！');

                this.getParamsData();
                this.addDialogVisible = false;
            })
        },
        //修改参数对话框
        async showEditDialog(id){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{params:{attr_sel:this.activeName}});
            if(res.meta.status !== 200) return this.$message.error('获取参数失败！');
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields();
        },
        editParams(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return;
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name , attr_sel:this.activeName});
                if(res.meta.status !== 200) return this.$message.error('修改参数失败！');
                this.$message.success('修改参数成功！');

                this.getParamsData();
                this.editDialogVisible = false;
            })
        },
        async removeParams(id){
            //弹框询问
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).catch(err=>err);//取消返回取消
            if(confirmResult !== 'confirm') return this.$message.info('已取消删除');
            const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`);
            if(res.meta.status !==200 ) return this.$message.error('删除参数失败！');
            this.$message.success('删除参数成功！');
            //刷新列表数据
            this.getParamsData();
        }
    }
}
</script>

<style scoped>
.cat_opt{
    margin:15px;
}
.el-tag{
    margin:10px;
}
</style>
