<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogFormVisible"
      width="700px"
      @close="close"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="备注" prop="description">
          <div>
            <el-input v-model="form.description" type="textarea" :rows="2" />
          </div>
        </el-form-item>
        <el-form-item label="选择老师" prop="teacher_id">
          <el-select v-model="form.teacher_id" filterable placeholder="请选择">
            <el-option
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="description">
          <div>
            <el-date-picker
              v-model="form.start_time"
              type="datetime"
              placeholder="选择日期时间"
            ></el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="结束日期" prop="description">
          <div>
            <el-date-picker
              v-model="form.end_time"
              type="datetime"
              placeholder="选择日期时间"
            ></el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="实际课时" prop="real_time">
          <div style="width: 100px">
            <el-input v-model="form.real_time" min="0" type="number" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'历史记录'"
      :visible.sync="dialogPreviewVisible"
      width="800px"
      custom-class="dialog-preview"
      @close="close"
    >
      <el-table :data="previewData" stripe>
        <el-table-column label="序号" width="95" align="center">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="修改记录"
          prop="event"
          width="500"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="created_at"
          label="日期"
          align="center"
        ></el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPreviewVisible = false">
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { doEdit } from '@/api/table'
  import request from '@/utils/request'
  import { siteUrl } from '@/config'
  import { timeFormat } from '@/utils/date'

  export default {
    name: 'TableEdit',
    data() {
      return {
        form: {
          student_id: '',
          course_id: '',
          teacher_id: '',
          // num_class: 1,
          predict_time: 1,
          classroom_id: '',
          type: 1,
          name: '',
          description: '',
          start_date: '',
          start_time: '',
          week_type: [],
          schedul_time: [],
        },
        rules: {
          student_id: [
            {
              required: true,
              trigger: 'change',
              message: '请至少选择一个学生',
            },
          ],
          course_id: [
            {
              required: true,
              trigger: 'change',
              message: '请至少选择一个学科',
            },
          ],
          teacher_id: [
            {
              required: true,
              trigger: 'change',
              message: '请至少选择一个学科',
            },
          ],
          classroom_id: [
            {
              required: true,
              trigger: 'change',
              message: '请至少选择一个教室',
            },
          ],
          start_date: [
            { required: true, trigger: 'change', message: '请选择开始日期' },
          ],
          start_time: [
            { required: true, trigger: 'change', message: '请选择开始时间' },
          ],
          week_type: [
            {
              required: true,
              trigger: 'change',
              message: '请选择至少一个周类型',
            },
          ],
        },
        title: '',
        dialogFormVisible: false,
        dialogPreviewVisible: false,
        studentList: [],
        teacherList: [],
        subjectList: [],
        classRoomList: [],
        weekList: [
          {
            id: 0,
            name: '星期天',
          },
          {
            id: 1,
            name: '星期一',
          },
          {
            id: 2,
            name: '星期二',
          },
          {
            id: 3,
            name: '星期三',
          },
          {
            id: 4,
            name: '星期四',
          },
          {
            id: 5,
            name: '星期五',
          },
          {
            id: 6,
            name: '星期六',
          },
        ],
        previewData: [
          {
            date: '2016-05-02',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄',
          },
          {
            date: '2016-05-04',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄',
          },
          {
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄',
          },
          {
            date: '2016-05-03',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄',
          },
        ],
      }
    },
    created() {},
    mounted() {},
    methods: {
      showEdit(row) {
        this.getStudentList()
        this.getTeacherList()
        this.getSubjectList()
        this.getClassRoomList()

        // 处理一下拿到的时间
        const start_time = Number(row.start_time) * 1000
        const end_time = Number(row.end_time) * 1000

        const start_date = timeFormat(start_time, 'yyyy-MM-dd')
        const start_date_hour = [
          timeFormat(start_time, 'yyyy-MM-dd hh:mm'),
          timeFormat(end_time, 'yyyy-MM-dd hh:mm'),
        ]

        if (!row) {
          this.title = '添加'
        } else {
          this.title = '编辑'
          this.form = Object.assign({}, row, {
            start_date,
            start_date_hour,
            start_time: start_date_hour[0],
            end_time: start_date_hour[1],
          })
        }
        this.dialogFormVisible = true
      },

      async showHistory(row) {
        // 查找历史记录
        const result = await request({
          url: 'https://mastercenter.cn/api/history/list',
          method: 'post',
          data: {
            schedul_id: row.id,
            page: 1,
            limit: 100,
          },
        })
        if (result && result.data) {
          this.previewData = result.data.list
          this.dialogPreviewVisible = true
        }
      },
      close() {
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetchData')
      },
      format(value) {
        return timeFormat(value, 'yyyy-MM-dd hh:mm')
      },
      getHourAndMin(date) {
        return date.split(':').map((item) => Number(item))
      },
      getYearAndMonthAndDay(date) {
        return [date.getFullYear(), date.getMonth(), date.getDate()]
      },
      // 获取学生的信息
      async getStudentList() {
        const result = await request({
          url: 'https://mastercenter.cn/api/user/get_type_user_list',
          method: 'post',
          data: {
            page: 1,
            limit: 1000,
            type: '1',
          },
        })
        if (result && result.data) {
          this.studentList = result.data.list
        }
      },
      // 获取学生的信息
      async getTeacherList() {
        const result = await request({
          url: 'https://mastercenter.cn/api/user/get_type_user_list',
          method: 'post',
          data: {
            page: 1,
            limit: 1000,
            type: '3',
          },
        })
        if (result && result.data) {
          this.teacherList = result.data.list
        }
      },
      // 获取科目的信息
      async getSubjectList() {
        const result = await request({
          url: 'https://mastercenter.cn/api/course/list',
          method: 'post',
          data: {
            page: 1,
            limit: 1000,
          },
        })
        if (result && result.data) {
          this.subjectList = result.data.list
        }
      },
      // 获取科目的信息
      async getClassRoomList() {
        const result = await request({
          url: 'https://mastercenter.cn/api/schedul/list',
          method: 'post',
          data: {
            page: 1,
            limit: 1000,
          },
        })
        if (result && result.data) {
          this.classRoomList = result.data.list
        }
      },

      handleDelete(index) {
        this.previewData.splice(index, 1)
        this.form.schedulItem.splice(index, 1)
      },

      saveMain() {
        this.$nextTick(async () => {
          // 传给后端的时间戳转成unix
          const schedul_time = this.previewData.map((item) => {
            return {
              start_time: item.start_time / 1000,
              end_time: item.end_time / 1000,
            }
          })

          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/add',
            method: 'post',
            data: {
              ...this.form,
              schedul_time,
            },
          })
          if (result && result.data) {
            this.$baseMessage('添加成功', 'success')
            this.$refs['form'].resetFields()
            this.dialogFormVisible = false
            this.dialogPreviewVisible = false
            this.form = this.$options.data().form
          } else {
            this.$baseMessage(result.msg || this.title + '失败', 'error')
          }
        })
      },

      save() {
        this.$refs['form'].validate(async (valid) => {
          let { id, description, real_time, start_time, end_time, teacher_id } = this.form
           if (!end_time || !start_time) {
            this.$baseMessage('请填写时间', 'warning')
            return
          }
          if (typeof start_time == 'object') start_time = start_time.getTime()
          else if (typeof start_time == 'string')
            start_time = new Date(start_time).getTime()

          if (typeof end_time == 'object') end_time = end_time.getTime()
          else if (typeof end_time == 'string')
            end_time = new Date(end_time).getTime()
          
          if (end_time < start_time) {
            this.$baseMessage('结束时间必须大于开始时间', 'warning')
            return
          }
          if (valid) {
            const result = await request({
              url: 'https://mastercenter.cn/api/schedul/schedul_modify',
              method: 'post',
              data: {
                id,
                description,
                real_time,
                teacher_id,
                start_time: start_time / 1000,
                end_time: end_time / 1000,
              },
            })
            if (result && result.data) {
              this.$baseMessage('修改成功', 'success')
              this.$refs['form'].resetFields()
              this.dialogFormVisible = false
              this.form = this.$options.data().form
            } else {
              this.$baseMessage(result.msg || this.title + '失败', 'error')
            }
          }
        })
      },
    },
  }
</script>

<style lang="scss">
  .dialog-preview {
    .el-dialog__body {
      max-height: 500px;
      overflow-y: scroll;
    }
  }
</style>
