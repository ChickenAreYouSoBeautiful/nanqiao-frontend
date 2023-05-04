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

    <el-table
      v-loading="listLoading"
      :data="list.filter(data => !search || data.title.toLowerCase().includes(search.toLowerCase()))"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >

      <el-table-column label="ID" width="80">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="项目名称" width="150">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="项目图片" align="center" width="110" >
        <template slot-scope="scope">
          <img :src="scope.row.img" alt="项目图片" class="proImg">
        </template>
      </el-table-column>
      <el-table-column label="项目时长" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.duration }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="价格" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="消费人数" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.consumeCount }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column width="260" align="right">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="search"
            size="mini"
            placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="success"
            @click="handleSelectPhysio(scope.row)">选择技师
          </el-button>
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

        <el-form-item label="项目图片" prop="title">
          <el-col :span="16">
            <el-input type="text" disabled v-model="temp.img"></el-input>
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


        <el-form-item label="项目价格" prop="title">
          <el-input type="number" v-model="temp.price"/>
        </el-form-item>

        <el-form-item label="项目名称" prop="title">
          <el-input v-model="temp.title"/>
        </el-form-item>

        <el-form-item label="项目时长" prop="title">
          <el-input v-model="temp.duration"/>
        </el-form-item>
        <el-form-item label="消费人数" prop="title">
          <span>{{ temp.consumeCount }}</span>
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

    <!--  模态框中的技师列表  -->
    <el-dialog title="技师列表" :visible.sync="dialogPhysioList">
      <el-table
        :data="physioList"
        style="width: 100%">
        <el-table-column
          label="ID"
          width="80">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="昵称"
          width="180">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="top">
              <p>昵称: {{ scope.row.nickname }}</p>
              <p>收藏数: {{ scope.row.like }}</p>
              <p>服务单数: {{ scope.row.billCount }}</p>
              <div slot="reference" class="name-wrapper">
                <el-tag size="medium">{{ scope.row.nickname }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column label="头像" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.avatar" alt="头像" class="proImg">
          </template>
        </el-table-column>

        <el-table-column label="服务状态" width="150" align="center">
          <template slot-scope="scope">
            <el-button size="mini" v-if="scope.row.state" type="success">可服务</el-button>
            <el-button size="mini" v-else type="danger">不可服务</el-button>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              :disabled="!scope.row.state"
              size="mini"
              @click="handleOrder(scope.$index, scope.row)">马上预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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

export default {
  data() {
    return {
      fileList: [
        {url: ''}
      ],
      limit: 1,
      titleSearch: '', // 搜索框的内容
      search: '',
      list: null,
      listLoading: true,
      page: 1, // 当前第几页
      size: 10, // 每页多少条数据
      total: 0, // 总共多少条记录
      dialogFormVisible: false,
      dialogPhysioList: false, // 是否展示技师列表
      physioList: [],
      dialogStatus: '',
      textMap: {
        update: '编辑服务项目',
        create: '新增服务项目'
      },
      temp: {
        id: undefined,
        img: '',
        price: 0,
        createTime: new Date(),
        title: '',
        duration: '',
        consumeCount: 0
      },
      downloadLoading: false,
      // 点选择技师按钮时选中的项目信息
      tempProject: {
        projectId: 0,
        projectName: '',
        totalMoney: 0
      }
    }
  },
  created() {
    this.fetchData(this.page, this.size)
  },
  methods: {
    // 马上预约
    handleOrder(index, row) {
      // 到后端发送下订单的请求
      let vm = this;
      this.axios({
        url: 'http://localhost:8080/order/insert',
        method: 'post',
        data: {
          "physioId": row.id,
          "physioName": row.nickname,
          "projectId": vm.tempProject.projectId,
          "projectName": vm.tempProject.projectName,
          "totalMoney": vm.tempProject.totalMoney
        }
      }).then(function (res) {
        if (res.data.code == 200) {
          vm.$notify({
            title: '成功',
            message: '技师预约成功，请到订单页付款',
            type: 'success',
            duration: 2000
          })
          // 预约成功1s后调整到订单列表页
          let timer = setTimeout(() => {
            vm.$router.push('/order/list')
            // 调整完成后 取消定时器
            clearTimeout(timer)
          }, 1000)
        } else {
          vm.$notify({
            title: '失败',
            message: '技师预约失败，请重试',
            type: 'error',
            duration: 2000
          })
        }
      })
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
        img: '',
        price: 0,
        createTime: new Date(),
        title: '',
        duration: '',
        consumeCount: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.fileList.length = 0
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '项目名称', '时长', '价格', '消费人数', '创建时间']
        const filterVal = ['id', 'title', 'duration', 'price', 'consumeCount', 'createTime']
        const data = this.formatJson(filterVal)
        console.log(data)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '服务项目列表'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => v[j]))
    },
    handleRemove() {
      console.log("删除了图片")
      this.temp.img = '';
    },
    handleSuccess(res) {
      console.log(res)
      if (res.code == 200) {
        this.temp.img = res.data;
        this.$notify({
          title: '成功 ',
          message: '文件上传成功',
          type: 'success',
          duration: 2000
        })
      } else {
        this.temp.img = '';
        this.fileList = [];
        this.$notify({
          title: '失败',
          message: '文件上传失败',
          type: 'success',
          duration: 2000
        })
      }
    },
    // 点击选择技师按钮
    handleSelectPhysio(row) {
      this.tempProject = {
        projectId: row.id,
        projectName: row.title,
        totalMoney: row.price
      }
      // 展示技师列表的模态框
      this.dialogPhysioList = true
      // 到后端发送请求获取当前项目的技师列表
      let vm = this;
      this.axios({
        url: `http://localhost:8080//physio/project/${row.id}`,
        method: 'get'
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，更新表单中的数据
          vm.physioList = res.data.data
        }
      })
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 根据ID查询尧编辑的数据,在模态框中回显
      let vm = this;
      this.axios({
        url: `http://localhost:8080/project/${row.id}`,
        method: 'get'
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，更新表单中的数据
          vm.temp = res.data.data
          vm.fileList.length = 0
          vm.fileList.push({url: res.data.data.img})
        }
      })
    },
    updateData() {
      // 更新服务项目
      let vm = this;
      this.axios({
        url: 'http://localhost:8080/project/update',
        method: 'post',
        data: vm.temp
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，路由到主页面
          vm.$notify({
            title: '成功',
            message: '服务项目更新成功',
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
    // 新增服务
    createData() {
      // 到后端发送添加服务项目请求
      let vm = this;
      vm.temp.createTime = ''
      this.axios({
        url: 'http://localhost:8080/project/insert',
        method: 'post',
        data: vm.temp
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，路由到主页面
          vm.$notify({
            title: '成功',
            message: '服务项目新增成功',
            type: 'success',
            duration: 2000
          })
          vm.dialogFormVisible = false;
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
        url: `http://localhost:8080/project/${row.id}`,
        method: 'delete'
      }).then(function (res) {
        if (res.data.code == 200) {
          // 如果响应成功，路由到主页面
          vm.$notify({
            title: '成功',
            message: '服务项目删除成功',
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
        url: 'http://localhost:8080/project/page',
        method: 'post',
        data: {
          'page': page,
          'size': size,
          'title': vm.titleSearch
        },
        transformRequest: [function (data) {
          return Qs.stringify(data)
        }]
      }).then(function (res) {
        if (res.data.code == 200) {
          vm.list = res.data.data.list;
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
