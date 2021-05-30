<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图-->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList()">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList()"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!--table表格区-->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column  label="订单编号" prop="order_number"></el-table-column>
                <el-table-column  label="订单价格" prop="order_price"></el-table-column>
                <el-table-column  label="是否付款">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column  label="是否发货" prop="=is_send"></el-table-column>
                <el-table-column  label="下单时间" >
                    <template v-slot="scope">
                        <!--使用过滤器-->
                        {{scope.row.create_time | dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column  label="操作" >
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox(scope.row.goods_id)" ></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!--分页区域-->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>

        <!--修改参数对话框-->
        <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader clearable 
                    v-model="addressForm.address1"
                    :options="cityData"
                    :props="{ expandTrigger: 'hover' }">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!--物流进度对话框-->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" @close="progressDialogClosed">
            <span>物流信息</span>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    data(){
        return{
            //查询参数
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            orderlist:[],
            total:0,
            //修改表单
            addressVisible:false,
            addressForm:{
                address1:[],
                address2:''
            },
            addressFormRules:{
                address1:[{
                    required:true, message:'请选择省市区/县',trigger:'blur'
                }],
                address2:[{
                    required:true, message:'请输入详细地址',trigger:'blur'
                }]
            },
            cityData,

            //物流进度
            progressVisible:false,
            progressInfo:[],
        }
    },
    created(){
        this.getOrderList();
    },
    computed:{

    },
    methods:{
        //获取商品订单列表
        async getOrderList(){
            const {data:res} = await this.$http.get('orders',{params: this.queryInfo});
            if(res.meta.status !== 200) return this.$message.error('获取订单列表失败！'); 
            this.$message.success('获取订单列表成功！');
            this.orderlist = res.data.goods;
            this.total = res.data.total;
        },
        //监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getOrderList();
        },
        //监听页码值改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getOrderList();
        },
        //展示修改地址对话框
        showBox(){
            this.addressVisible = true;
        },
        //监听关闭dialog重置
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields();
        },
        //展示物流进度对话框
        async showProgressBox(){
            this.progressVisible = true;
            
        },
        //监听关闭dialog重置
        progressDialogClosed(){
            this.$refs.addressFormRef.resetFields();
        },
    },
}
</script>

<style scoped>
.el-cascader{
    width: 100%;
}
</style>
