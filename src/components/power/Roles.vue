<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!--添加角色按钮区域-->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRolesVisible=true">添加角色</el-button>
                </el-col>
            </el-row>
            <!--角色列表区-->
            <el-table :data="rolesList" border stripe> 
                <!--展开列-->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-row :class="['vcenter','bdbottom', i1==0?'bdtop':'']" v-for="(item1,i1) in scope.row.children" :key="item1.id" >
                            <!--渲染一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--渲染二级和三级权限-->
                            <el-col :span="19">
                                <el-row :class="['vcenter', i2==0?'':'bdtop']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable @close="removeRightById(scope.row, item2.id)" type="success" >{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row, item3.id)" type="warning" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        
                    </template>
                </el-table-column>
                <!--索引列-->
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRolesDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRolesById(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--添加角色的对话框-->
        <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="50%" @close="addRolesClosed">
        <!--内容主体-->
        <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="70px">
            <el-form-item label="角色名称" prop="roleName" label-width="80px">
                <el-input v-model="addRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
                <el-input v-model="addRolesForm.roleDesc" ></el-input>
            </el-form-item>
        </el-form>
        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addRolesVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
        </el-dialog>

        <!--修改角色话框-->
        <el-dialog title="修改角色" :visible.sync="editRolesVisible" width="50%" @close="editRolesClosed">
            <el-form :model="editRolesForm" :rules="editRolesFormRules" ref="editRolesFormRef" label-width="70px">
                <el-form-item label="角色名称" prop="roleName" label-width="80px">
                    <el-input v-model="editRolesForm.roleName" ></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
                    <el-input v-model="editRolesForm.roleDesc" ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRolesVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRolesInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!--分配权限对话框-->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%"  @close="setRightDialogClosed">
            <!--树形空间-->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" 
            default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRightsInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return{
            rolesList:[],
            addRolesVisible:false,
            addRolesForm:{
                roleName:'',
                roleDesc:''
            },
            addRolesFormRules:{
                roleName:[
                    {required:true,message:'请输入角色名称',trigger:'blur'},
                    {min:3,max:10,message:'用户名长度在3~10个字符之间',trigger:'blur'}
                ],
                roleDesc:[
                    {required:true,message:'请输入角色描述',trigger:'blur'},
                    {min:3,max:10,message:'用户名长度在1~15个字符之间',trigger:'blur'}
                ]
            },
            editRolesVisible:false,
            editRolesForm:{},
            editRolesFormRules:{
                roleName:[
                    {required:true,message:'请输入角色名称',trigger:'blur'},
                    {min:3,max:10,message:'用户名长度在3~10个字符之间',trigger:'blur'}
                ],
                roleDesc:[
                    {required:true,message:'请输入角色描述',trigger:'blur'},
                    {min:3,max:10,message:'用户名长度在1~15个字符之间',trigger:'blur'}
                ]
            },
            //分配权限
            setRightDialogVisible:false,
            rightslist:[],
            //树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            //默认勾选的权限ID值数组
            defKeys:[],
            //当前修改的ID值
            roleId:''


        }
    },
    created(){
        this.getRolesList();
    },
    methods:{
        async getRolesList(){
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
            this.rolesList = res.data;
        },
        addRolesClosed(){
            this.$refs.addRolesFormRef.resetFields();
        },
        addRoles(){
            this.$refs.addRolesFormRef.validate(async valid=>{
                if(!valid) return;
                //发起添加用户请求
                const {data:res} = await this.$http.post('roles', this.addRolesForm);
                if(res.meta.status!== 201) this.$message.error('添加角色失败！');
                this.$message.success('添加角色成功！');
                this.addRolesVisible = false;
                //刷新列表数据
                this.getRolesList();
            });
        },
        async showEditRolesDialog(id){
            const {data:res} = await this.$http.get('roles/'+id);
            if(res.meta.status !== 200) return this.$message.error('查询角色信息失败！');
            this.editRolesForm = res.data;
            this.editRolesVisible = true;
        },
        //监听修改角色对话框关闭事件
        editRolesClosed(){
            this.$refs.editRolesFormRef.resetFields();
        },
        //确定修改角色
        editRolesInfo(){
            this.$refs.editRolesFormRef.validate(async valid=>{
                if(!valid) return;
                //发起修改角色请求
                const {data:res} = await this.$http.put('roles/'+this.editRolesForm.roleId, {roleName:this.editRolesForm.roleName,roleDesc:this.editRolesForm.roleDesc});
                
                if(res.meta.status!== 200) this.$message.error('更新角色信息失败！');
                this.$message.success('更新角色成功！');
                this.editRolesVisible = false;
                //刷新列表数据
                this.getRolesList();
            });
        },
        //删除用户
        async removeRolesById(id){
            //弹框询问
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).catch(err=>err);//取消返回取消
            if(confirmResult !== 'confirm') return this.$message.info('已取消删除');
            const {data:res} = await this.$http.delete('roles/'+id);
            if(res.meta.status !==200 ) return this.$message.error('删除用户失败！');
            this.$message.success('删除用户成功！');
            //刷新列表数据
            this.getRolesList();
        },
        //根据ID删除对应权限
        async removeRightById(role,rightId){
            //弹窗询问
            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).catch(err=>err);//取消返回取消
            if(confirmResult !== 'confirm') return this.$message.info('已取消删除');
            const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
            if(res.meta.status !==200 ) return this.$message.error('删除权限失败！');
            this.$message.success('删除用户成功！');
            //刷新列表数据
            role.children = res.data;
        },
        //展示分配权限对话框
        async showSetRightDialog(role){
            this.roleId = role.id;
            const {data:res} = await this.$http.get('rights/tree');
            if(res.meta.status !== 200) return this.$message.error('查询权限信息失败！');
            this.rightslist = res.data;

            //递归获取三级权限
            this.getLeafKeys(role, this.defKeys);

            this.setRightDialogVisible = true;
        },
        //递归形式获取角色三级权限保存到数组
        getLeafKeys(node,arr){
            if(!node.children){
                return arr.push(node.id);
            }
            node.children.forEach(element => {
                this.getLeafKeys(element, arr);
            });
        },
        //监听关闭修改权限对话框
        setRightDialogClosed(){
            this.defKeys = [];
        },
        //为角色分配权限
        async setRightsInfo(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]  
            //拼接
            const idStr = keys.join(',');

            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
            if(res.meta.status !== 200) return this.$message.error('分配权限失败！');
            this.$message.success('分配权限成功！');

            this.getRolesList();
            this.setRightDialogVisible = false;

        }
    }
}
</script>

<style scoped>
.el-tag{
    margin:7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}

.vcenter{
    display: flex;
    align-items: center;
}
</style>
