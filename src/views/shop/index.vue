<template>
  <div class="app-container">
    <el-input v-model="titleSearch" placeholder="请输入项目名称" style="width: 400px;" class="filter-item"/>
    <el-button class="filter-item" type="primary" icon="el-icon-search" @click="fetchData(page,size)">
      搜索
    </el-button>

    <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
      添加
    </el-button>

    <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download"
               @click="handleDownload">
      导出
    </el-button>

    <el-cascader :props="props"></el-cascader>

    <el-table
      v-loading="listLoading"
      :data="list.filter(data => !search || data.title.toLowerCase().includes(search.toLowerCase()))"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >

      <el-table-column label="ID" width="100">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="商品名称" width="200">
        <template slot-scope="scope">
          {{ scope.row.spname }}
        </template>
      </el-table-column>
      <el-table-column label="商品图片" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.sptupian" alt="图片" class="proImg">
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="商品价格" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.spjiage }}
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="创建时间" width="210" align="center">
        <template slot-scope="scope">
          {{ scope.row.spaddtime }}
        </template>
      </el-table-column>

      <el-table-column width="200" align="right">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="search"
            size="mini"
            placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:50px;">
        <el-form-item label="ID" prop="id" v-show="false">
          <el-input v-model="temp.id" disabled/>
        </el-form-item>

        <el-form-item label="商品名称" prop="nickname">
          <el-input v-model="temp.spname"/>
        </el-form-item>

        <el-form-item label="商品图片" prop="title">
          <el-col :span="16">
            <el-input type="text" disabled v-model="temp.sptupian"></el-input>
          </el-col>
          <el-upload
            action="http://localhost:8080/file/upload"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :file-list="fileList"
            :limit="limit"
            list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品价格" prop="spjiage">
          <el-input v-model="temp.spjiage"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <!--  分页  -->
    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10,50,100]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import Qs from 'qs'
import {parseTime} from "@/utils";
let id = 0;

export default {
  data() {
    return {
      props: {
        lazy: true,
        lazyLoad (node, resolve) {
          const { level } = node;
          setTimeout(() => {
            const nodes = Array.from({ length: level + 1 })
              .map(item => ({
                value: ++id,
                label: `选项${id}`,
                leaf: level >= 2
              }));
            // 通过调用resolve将子节点数据返回，通知组件数据加载完成
            resolve(nodes);
          }, 1000);
        }
      },

      projects: [], // 所有的服务项目
      projectIds: [], // 用户选择的服务项目ID
      fileList: [],
      limit: 1,
      titleSearch: '', // 搜索框的内容
      search: '',
      list: null,
      listLoading: true,
      page: 1, // 当前第几页
      size: 10, // 每页多少条数据
      total: 0, // 总共多少条记录
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑理疗师',
        create: '新增理疗师'
      },
      modalSwitch: true,
      temp: {
        id: undefined,
        spname: '',
        sptupian: '',
        spjiage: 1,
        spaddtime: '',
        lbid: 0
      },
      downloadLoading: false
    }
  },
  created() {
    this.fetchData(this.page, this.size)
  },
  methods: {
    findSpnamByType(){

    },
    // 每页几条记录修改时触发
    handleSizeChange(size) {
      this.size = size;
      this.fetchData(this.page, size)
    },
    // 选择第几页后触发
    handleCurrentChange(page) {
      this.page = page;
      this.fetchData(page, this.size)
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        spname: '',
        sptupian: '',
        spjiage: 1,
        spaddtime: ''
      }
    },
    // 点击新增按钮
    handleCreate() {
      this.fileList.length = 0
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 到后端查询所有服务项目的ID和名称
      let vm = this
      this.axios({url: 'http://localhost:8080/project/list'}).then(function (res) {
        vm.projects = res.data.data
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '昵称', '服务状态', '收藏数', '服务单数']
        const filterVal = ['id', 'nickname', 'state', 'like', 'billCount']
        const data = this.formatJson(filterVal)
        console.log(data)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '理疗师列表'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j == 'state') {
          return v[j] == 1 ? '可服务' : '不可服务'
        }
        return v[j]
      }))
    },
    handleRemove() {
      console.log("删除了图片")
      this.temp.sptupian = '';
    },
    handleSuccess(res) {
      console.log(res)
      if (res.code == 200) {
        this.temp.sptupian = res.data;
        this.$notify({
          title: '成功 ',
          message: '文件上传成功',
          type: 'success',
          duration: 2000
        })
      } else {
        this.temp.sptupian = '';
        this.fileList = [];
        this.$notify({
          title: '失败',
          message: '文件上传失败',
          type: 'success',
          duration: 2000
        })
      }
    },
    handleUpdate(row) {
      this.fileList.length = 0
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 根据ID查询理疗师的数据,在模态框中回显
      let vm = this;
      this.axios({
        url: `http://localhost:8080/shop/${row.id}`,
        method: 'get'
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，更新表单中的数据
          vm.temp = res.data.data
          vm.fileList.push({url: res.data.data.sptupian})

          console.log(res.data.data)
          // 服务状态的开关按钮
          vm.modalSwitch = res.data.data.state == 1
          // 当前理疗师可以服务哪些项目
          vm.projectIds = res.data.data.projectIds
          // 获取所有服务项目
          vm.axios({url: 'http://localhost:8080/project/list'}).then(function (res) {
            vm.projects = res.data.data
          })
        }
      })
    },
    updateData() {
      // 更新理疗师
      let vm = this;
      this.axios({
        url: 'http://localhost:8080/shop/update',
        method: 'post',
        data: {
          sptupian: vm.temp.sptupian,
          id: vm.temp.id,
          spname: vm.temp.spname,
          spjiage:vm.temp.spjiage
        }
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，路由到主页面
          vm.$notify({
            title: '成功',
            message: '商品更新成功',
            type: 'success',
            duration: 2000
          })
          vm.dialogFormVisible = false;
          vm.fetchData(vm.page, vm.size)
        } else {
          // 商品更新失败
          vm.$notify({
            title: '失败',
            message: res.data.msg,
            type: 'success',
            duration: 2000
          })
        }
      });
    },
    // 新增理疗师
    createData() {
      // 到后端发送添加理疗师请求
      let vm = this;
      this.axios({
        url: 'http://localhost:8080/shop/insert',
        method: 'post',
        data: {
          spname: vm.temp.spname,
          sptupian: vm.temp.sptupian,
          spjiage: vm.temp.spjiage,
        }
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，路由到主页面
          vm.$notify({
            title: '成功',
            message: '商品新增成功',
            type: 'success',
            duration: 2000
          })
          vm.dialogFormVisible = false;
          vm.projectIds = [];
          vm.temp.sptupian = '';
          vm.fetchData(vm.page, vm.size)
        } else {
          // 服务项目新增失败
          vm.$notify({
            title: '失败',
            message: res.data.msg,
            type: 'success',
            duration: 2000
          })
        }
      });
    },
    handleDelete(row, index) {
      console.log(row.id);
      let vm = this;
      this.axios({
        url: `http://localhost:8080/shop/${row.id}`,
        method: 'delete'
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，路由到主页面
          vm.$notify({
            title: '成功',
            message: '商品删除成功',
            type: 'success',
            duration: 2000
          })
          vm.fetchData(vm.page, vm.size)
        } else {
          // 商品更新失败
          vm.$notify({
            title: '失败',
            message: res.data.msg,
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    // 获取数据
    fetchData(page, size) {
      this.listLoading = true
      // 使用axios到后端获取数据
      let vm = this;
      this.axios({
        url: 'http://localhost:8080/shop/page',
        method: 'post',
        data: {
          'page': page,
          'size': size,
        },
        transformRequest: [function (data) {
          return Qs.stringify(data)
        }]
      }).then(function (res) {
        if (res.data.code == 200) {
          console.log(res.data)
          console.log("后端返回的理疗师列表是")
          console.log(res.data.data.list)
          vm.list = res.data.data.list;
          console.log(vm.list)
          vm.total = res.data.data.total
          vm.listLoading = false
        } else {
          vm.$notify({
            title: '失败',
            message: '请求失败',
            type: 'success',
            duration: 2000
          })
        }
      })
    }
  }
}

</script>

<style scoped>
.proImg {
  width: 80px;
  border-radius: 10px;
}

.block {
  margin: 20px auto;
}

</style>
