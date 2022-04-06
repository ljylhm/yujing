<template>
  <div class="table-container">
    <vab-query-form>
      <vab-query-form-left-panel :span="4">
        <el-button icon="el-icon-plus" type="primary" @click="handleAdd">
          添加
        </el-button>
        <!-- <el-button icon="el-icon-delete" type="danger" @click="handleDelete">
          删除
        </el-button> -->
        <!-- <el-button type="primary" @click="testMessage">baseMessage</el-button>
        <el-button type="primary" @click="testALert">baseAlert</el-button>
        <el-button type="primary" @click="testConfirm">baseConfirm</el-button>
        <el-button type="primary" @click="testNotify">baseNotify</el-button> -->
      </vab-query-form-left-panel>
      <vab-query-form-right-panel :span="20">
        <el-form
          ref="form"
          :model="queryForm"
          :inline="true"
          @submit.native.prevent
        >
          <el-form-item label="学科">
            <el-input v-model="queryForm.course_name" placeholder="请输入学科查询" />
          </el-form-item>
          <el-form-item label="学生">
            <el-input v-model="queryForm.student_name" placeholder="请输入学生查询" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="queryForm.status" placeholder="请选择">
              <el-option
                :label="'全部'"
                :value="''">
              </el-option>
              <el-option
                v-for="item in tagList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              icon="el-icon-search"
              type="primary"
              native-type="submit"
              @click="handleQuery"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </vab-query-form-right-panel>
    </vab-query-form>

    <el-table
      ref="tableSort"
      v-loading="listLoading"
      :data="list"
      :element-loading-text="elementLoadingText"
      :height="height"
      @selection-change="setSelectRows"
      @sort-change="tableSortChange"
    >

      <el-table-column  label="序号" width="95" align="center">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        
        label="学科名"
        prop="course_name"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="学生"
        prop="student_name"
        align="center"
      ></el-table-column>
      <el-table-column
        
        label="总课时"
        prop="num_class"
        width="200"
        align="center"
      ></el-table-column>
      <el-table-column  label="状态" width="180px" align="center">
        <template #default="{ row }">
            <el-tag :type="tagList[row.status].type">{{tagList[row.status].name}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column  label="操作" width="180px" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="checkStatus(row.id, 1)" v-if="row.status == 0">通过</el-button>
          <el-button type="text" @click="checkStatus(row.id, 2)" v-if="row.status == 0">不通过</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :background="background"
      :current-page="queryForm.page"
      :layout="layout"
      :page-size="queryForm.limit"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    ></el-pagination>
    <table-edit ref="edit" v-on:fetchData='fetchData'></table-edit>
  </div>
</template>

<script>
  import { getList, doDelete } from '@/api/table'
  import TableEdit from './components/TableEdit'
  import request from '@/utils/request'
  export default {
    name: 'ComprehensiveTable',
    components: {
      TableEdit,
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger',
        }
        return statusMap[status]
      },
    },
    data() {
      return {
        imgShow: true,
        list: [],
        imageList: [],
        listLoading: true,
        layout: 'total, sizes, prev, pager, next, jumper',
        total: 0,
        background: true,
        selectRows: '',
        elementLoadingText: '正在加载...',
        queryForm: {
          page: 1,
          limit: 20,
          course_name: '',
          student_name: "",
          status: ""
        },
        tagList:{
          "0": {
            id: 0,
            name: "未审核",
            type: "success"
          },
          "1": {
            id: 1,
            name: "审核通过",
            type: "info"
          },
         "2": {
            id: 2,
            name: "审核未通过",
            type: "warning"
          }
        }
      }
    },
    computed: {
      height() {
        return this.$baseTableHeight()
      },
    },
    async created() {
      this.fetchData()
    },
    beforeDestroy() {},
    mounted() {},
    methods: {
      async checkStatus(id, status){

        this.$baseConfirm(`你确定要${status == 1 ? '通过' : '不通过'}当前项吗`, null, async () => {

             this.listLoading = true
             try {
                const result = await request({
                  url: "https://mastercenter.cn/api/student/class_add_check",
                  method: "post",
                  data: {
                    id,
                    status
                  }
                })
                this.listLoading = false
                if(result && result.data){
                   this.$baseMessage("完成审核", 'success')
                   this.fetchData()
                }
              } catch (error) {
                 this.$baseMessage(result.msg || '网络异常', 'error')
                 this.listLoading = false
              }
        })
      },
      tableSortChange() {
        const imageList = []
        this.$refs.tableSort.tableData.forEach((item, index) => {
          imageList.push(item.img)
        })
        this.imageList = imageList
      },
      setSelectRows(val) {
        this.selectRows = val
      },
      handleAdd() {
        this.$refs['edit'].showEdit()
      },
      handleEdit(row) {
        this.$refs['edit'].showEdit(row)
      },
      handleDelete(row) {
        if (row.id) {
          this.$baseConfirm('你确定要删除当前项吗', null, async () => {
            const { msg } = await doDelete({ ids: row.id })
            this.$baseMessage(msg, 'success')
            this.fetchData()
          })
        } else {
          if (this.selectRows.length > 0) {
            const ids = this.selectRows.map((item) => item.id).join()
            this.$baseConfirm('你确定要删除选中项吗', null, async () => {
              const { msg } = await doDelete({ ids: ids })
              this.$baseMessage(msg, 'success')
              this.fetchData()
            })
          } else {
            this.$baseMessage('未选中任何行', 'error')
            return false
          }
        }
      },
      handleSizeChange(val) {
        this.queryForm.limit = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.queryForm.page = val
        this.fetchData()
      },
      handleQuery() {
        this.queryForm.page = 1
        this.fetchData()
      },
      async fetchData() {
        this.listLoading = true
        try {
          const result = await request({
            url: "https://mastercenter.cn/api/student/class_list",
            method: "post",
            data: {
              ...this.queryForm
            }
          })
          if(result && result.data && result.data.list){
            this.list = result.data.list
            this.total = result.data.total
          }
        } catch (error) {

        }
        this.listLoading = false
      },
      testMessage() {
        this.$baseMessage('test1', 'success')
      },
      testALert() {
        this.$baseAlert('11')
        this.$baseAlert('11', '自定义标题', () => {
          /* 可以写回调; */
        })
        this.$baseAlert('11', null, () => {
          /* 可以写回调; */
        })
      },
      testConfirm() {
        this.$baseConfirm(
          '你确定要执行该操作?',
          null,
          () => {
            /* 可以写回调; */
          },
          () => {
            /* 可以写回调; */
          }
        )
      },
      testNotify() {
        this.$baseNotify('测试消息提示', 'test', 'success', 'bottom-right')
      },
    },
  }
</script>
