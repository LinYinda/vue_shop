<template>
    <div>
        <!--面包屑导航区-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图-->
        <el-card>
            <!--提示-->
            <el-alert
                title="添加商品信息"
                type="info"
                center
                show-icon
                :closable="false"
            ></el-alert>
            <!--步骤条-->
            <el-steps
                :space="200"
                :active="activeIndex - '0'"
                finish-status="success"
                align-center
            >
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!--tab栏区,外包统一的表单-->
            <el-form
                :model="addForm"
                :rules="addFormRules"
                ref="addFormRef"
                label-width="100px"
                label-position="top"
            >
                <el-tabs
                    :tab-position="'left'"
                    v-model="activeIndex"
                    :before-leave="beforeTabLeave"
                    @tab-click="tabClicked"
                >
                    <el-tab-pane
                        label="基本信息"
                        name="0"
                    >
                        <el-form-item
                            label="商品名称"
                            prop="goods_name"
                        >
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item
                            label="商品价格"
                            prop="goods_price"
                        >
                            <el-input
                                v-model="addForm.goods_price"
                                type="number"
                            ></el-input>
                        </el-form-item>
                        <el-form-item
                            label="商品重量"
                            prop="goods_weight"
                        >
                            <el-input
                                v-model="addForm.goods_weight"
                                type="number"
                            ></el-input>
                        </el-form-item>
                        <el-form-item
                            label="商品数量"
                            prop="goods_number"
                        >
                            <el-input
                                v-model="addForm.goods_number"
                                type="number"
                            ></el-input>
                        </el-form-item>
                        <el-form-item
                            label="商品分类"
                            prop="goods_cat"
                        >
                            <el-cascader
                                clearable
                                v-model="addForm.goods_cat"
                                :options="catelist"
                                :props="cateProps"
                                @change="handleChange"
                            ></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane
                        label="商品参数"
                        name="1"
                    >
                        <el-form-item
                            v-for="item in manyTableData"
                            :key="item.attr_id"
                            :label="item.attr_name"
                        >
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox
                                    :label="cb"
                                    v-for="(cb,i) in item.attr_vals"
                                    :key="i"
                                    border
                                ></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane
                        label="商品属性"
                        name="2"
                    >
                        <el-form-item
                            v-for="item in onlyTableData"
                            :key="item.attr_id"
                            :label="item.attr_name"
                        >
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane
                        label="商品图片"
                        name="3"
                    >
                        <!--action表示图片要上传的api地址,手动绑定请求头的token-->
                        <el-upload
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture"
                            :headers="headerObj"
                            :on-success="handleSuccess"
                        >
                            <el-button
                                size="small"
                                type="primary"
                            >点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane
                        label="商品内容"
                        name="4">
                        <!--富文本编辑器-->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!--添加商品-->
                        <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!--预览图片对话框-->
        <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%">
            <img :src="previewPath" class="preImg">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
  data() {
    return {
      //步骤条索引
      activeIndex: "0",
      //添加商品表单
      addForm: {
        goods_name: "",
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        //商品所属分类数组
        goods_cat: [],
        //图片数组
        pics: [],
        //商品详情描述
        goods_introduce:'',
        attrs:[]
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //商品分类的数据列表
      catelist: [],
      //级联选择框设置
      cateProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      //参数列表
      manyTableData: [],
      onlyTableData: [],
      //上传参数
      uploadURL: "http://106.53.73.30:8888/api/private/v1/upload",
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //预览图地址
      previewPath: "",
      previewVisible:false,
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2];
      else return null;
    }
  },
  methods: {
    //获取商品分类
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败！");

      this.catelist = res.data;
    },
    //级联选择器选中时触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = [];
    },
    //控制离开tab页行为,使用：绑定，因为看true和false
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    //点击tab行为
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "many" } }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取动态参数列表失败！");
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: "only" } }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取静态属性列表失败！");
        this.onlyTableData = res.data;
      }
    },
    //处理点击预览行为
    handlePreview(file) {
      this.previewPath = file.url;
      this.previewVisible = true;
    },
    //处理移除图片操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
    },
    //上传成功
    handleSuccess(res) {
      const picInfo = { pic: res.data.tmp_path };
      this.addForm.pics.push(picInfo);
    },
    //提交添加商品
     add(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid) return this.$message.error('请填写必要的表单项！');
        //改变提交数据形态,不可直接转成数组，级联选择器双向绑定会出错,需要深拷贝 lodash的cloneDeep(obj)
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(',');
        //处理动态参数和静态属性
        this.manyTableData.forEach(item=>{
          const newInfo = {attr_id:item.attr_id, attr_value:item.attr_vals.join(',')};
          this.addForm.attrs.push(newInfo);
        })
        this.onlyTableData.forEach(item=>{
          const newInfo = {attr_id:item.attr_id, attr_value:item.attr_vals};
          this.addForm.attrs.push(newInfo);
        })
        form.attrs = this.addForm.attrs;

        const {data:res} = await this.$http.post('goods', form);
        if(res.meta.status !== 201 ) return this.$message.error('添加商品失败！');
        this.$message.success('添加商品成功！');
        this.$router.push('/goods');
      })
    }
  }
};
</script>

<style scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.preImg{
    width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>

