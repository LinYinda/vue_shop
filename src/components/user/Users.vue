<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片区-->
        <el-card >
            <!--搜索与添加-->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getUserList()">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            <!--用户列表区-->
            <el-table :data="userList" border stripe> 
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" >
                    <!--获取当行属性，按需渲染-->
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <!--修改按钮-->
                        <!--修改数值用:value =""-->
                        <el-tooltip  effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!--删除按钮-->
                        <el-tooltip  effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        </el-tooltip>
                        <!--分配角色按钮-->
                        <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false" >
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页区域-->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
        <!--添加用户的对话框-->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!--内容主体-->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password" >
                <el-input v-model="addForm.password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
        </el-dialog>

        <!--修改用户对话框-->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" ></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile" ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!--分配角色对话框-->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close = "setRoleDialogClosed">
            <div>
                <p>当前用户:{{userInfo.username}}</p>
                <p>当前角色:{{userInfo.role_name}}</p>
                <p>分配新角色:
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                            v-for="item in rolesList"
                            :key="item.id"
                            :label="item.roleName"
                           :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        //验证email的规则，写在return前
        var checkEmail = (rule,value,cb)=>{
            const regEmail =  /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
            if(regEmail.test(value)) return cb();
            cb(new Error('请输入合法的邮箱'));
        };
        //验证手机号的规则
        var checkMobile=(rule,value,cb)=>{
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            if(regMobile.test(value)) return cb();
            cb(new Error('请输入合法的手机号'));
        };
        return{
            //获取用户列表的参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:2
            },
            userList:[],
            total:0,
            //控制用户对话框的显示与隐藏
            addDialogVisible:false,
            //添加的数据对象
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''


            },
            //添加表单的验证规则
            addFormRules:{
                username:[
                    {required:true,message:'请输入用户名',trigger:'blur'},
                    {min:3,max:10,message:'用户名长度在3~10个字符之间',trigger:'blur'}
                ],
                password:[
                    {required:true,message:'请输入密码',trigger:'blur'},
                    {min:3,max:10,message:'密码长度在6~15个字符之间',trigger:'blur'}
                ],
                email:[
                    {required:true,message:'请输入邮箱',trigger:'blur'},
                    //自定义验证方法
                    {validator: checkEmail,trigger:'blur'}

                ],
                mobile:[
                    {required:true,message:'请输入手机号',trigger:'blur'},
                    {validator: checkMobile,trigger:'blur'}
                ]
            },
            //修改用户对话框显示与隐藏
            editDialogVisible:false,
            editForm:{},
            //修改用户表单规则
            editFormRules:{
                email:[
                    {required:true,message:'请输入邮箱',trigger:'blur'},
                    //自定义验证方法
                    {validator: checkEmail,trigger:'blur'}

                ],
                mobile:[
                    {required:true,message:'请输入手机号',trigger:'blur'},
                    {validator: checkMobile,trigger:'blur'}
                ]
            },
            //分配角色对话框显示与隐藏
            setRoleDialogVisible:false,
            //需要分配角色用户信息
            userInfo:{},
            //所有角色的数据列表
            rolesList:[],
            //已选中的角色ID
            selectedRoleId:''

        }
    },
    created(){
        this.getUserList();
    },
    methods:{
        async getUserList(){
            const {data:res} = await this.$http.get('users',{params:this.queryInfo});
            if(res.meta.status!== 200) return this.$message.error('获取用户列表失败！');
            this.userList = res.data.users;
            this.total = res.data.total;
        },
        //监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getUserList();
        },
        //监听页码值改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getUserList();
        },
        //监听switch状态改变
        async userStateChanged(userInfo){
            //动态数据需要反引号传参
            const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`);
            if(res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state;
                return this.$message.error('更新用户状态失败！');
                }
            this.$message.success('更新用户状态成功！');
        },
        //监听增加用户对话框关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields();
        },
        //确定添加用户
        addUser(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return;
                //发起添加用户请求
                const {data:res} = await this.$http.post('users', this.addForm);
                if(res.meta.status!== 201) this.$message.error('添加用户失败！');
                this.$message.success('添加用户成功！');
                this.addDialogVisible = false;
                //刷新列表数据
                this.getUserList();
            });
        },
        //弹出相应修改对话框
        async showEditDialog(id){
            const {data:res} = await this.$http.get('users/'+id);
            if(res.meta.status !== 200) return this.$message.error('查询用户信息失败！');
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        //监听修改用户对话框关闭事件
        editDialogClosed(){
            this.$refs.editFormRef.resetFields();
        },
        //确定修改用户
        editUserInfo(){
            this.$refs.editFormRef.validate(async valid=>{
                if(!valid) return;
                //发起修改用户请求
                const {data:res} = await this.$http.put('users/'+this.editForm.id, {email:this.editForm.email,mobile:this.editForm.mobile});
                if(res.meta.status!== 200) this.$message.error('更新用户信息失败！');
                this.$message.success('更新用户成功！');
                this.editDialogVisible = false;
                //刷新列表数据
                this.getUserList();
            });
        },
        //删除用户
        async removeUserById(id){
            //弹框询问
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).catch(err=>err);//取消返回取消
            if(confirmResult !== 'confirm') return this.$message.info('已取消删除');
            const {data:res} = await this.$http.delete('users/'+id);
            if(res.meta.status !==200 ) return this.$message.error('删除用户失败！');
            this.$message.success('删除用户成功！');
            //刷新列表数据
            this.getUserList();
        },
        //显示分配角色对话框
        async showSetRoleDialog(userInfo){
            this.userInfo = userInfo;

            //获取所有角色列表
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
            this.rolesList = res.data;

            this.setRoleDialogVisible = true;
        },
        //保存角色权限
        async saveRoleInfo(){
            if(!this.selectedRoleId) return this.$message.error('请选择要分配的角色');
            const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid:this.selectedRoleId});
            if(res.meta.status !== 200) return this.$message.error('更新角色失败！');
            this.$message.success('更新角色成功！');

            this.getUserList();
            this.setRoleDialogVisible = false;
        },
        //监听关闭修改角色窗口
        setRoleDialogClosed(){
            this.selectedRoleId = '';
            this.userInfo={}
        }
    }
}
</script>

<style scoped>

</style>

