<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogFormVisible"
      width="700px"
      @close="close"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="选择学生" filterable prop="student_id">
          <el-select
            v-model="form.student_id"
            placeholder="请选择"
            :disabled="title == '编辑'"
          >
            <el-option
              v-for="item in studentList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择老师" prop="teacher_id">
          <el-select
            v-model="form.teacher_id"
            filterable
            placeholder="请选择"
            :disabled="title == '编辑'"
          >
            <el-option
              v-for="item in teacherList"
              :key="item.id"
              :label="item.name + '(' + item.description + ')'"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择科目" prop="course_id">
          <el-select
            v-model="form.course_id"
            placeholder="请选择"
            :disabled="title == '编辑'"
          >
            <el-option
              v-for="item in subjectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择教室" prop="classroom_id">
          <el-select
            v-model="form.classroom_id"
            placeholder="请选择"
            :disabled="title == '编辑'"
          >
            <el-option
              v-for="item in classRoomList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">天</el-radio>
            <el-radio :label="2">周</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.type == 2" label="周类型" prop="week_type">
          <el-checkbox-group v-model="form.week_type" size="medium">
            <el-checkbox
              v-for="city in weekList"
              :key="city.id"
              :label="city.name"
            >
              {{ city.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="首节课开始时间" prop="start_date">
          <el-date-picker
            v-if="form.type == 1"
            v-model="form.start_date"
            type="date"
            align="right"
            placeholder="开始日期"
          ></el-date-picker>

          <el-date-picker
            v-if="form.type == 2"
            v-model="form.start_date"
            type="week"
            format="yyyy 第 WW 周"
            placeholder="选择周"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="首节课时间" prop="start_time">
          <el-time-picker
            v-model="form.start_time"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            format="HH:mm"
            value-format="HH:mm"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="课程数量" prop="class_num">
          <div style="width: 100px">
            <el-input v-model="form.class_num" min="1" type="number" />
          </div>
        </el-form-item>
        <el-form-item label="课程备注" prop="description">
          <div>
            <el-input v-model="form.description" type="textarea" :rows="2" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'预览'"
      :visible.sync="dialogConflictVisible"
      width="800px"
      custom-class="dialog-preview"
      @close="close"
    >
      <el-table :data="previewData">
        <el-table-column
          prop="start_time"
          label="开始日期"
          width="300"
          align="center"
        >
          <template slot-scope="scope">
            {{ format(scope.row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="end_time"
          label="结束日期"
          width="300"
          align="center"
        >
          <template slot-scope="scope">
            {{ format(scope.row.end_time) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: right; padding: 10px 0px">
        总课时：
        <span style="color: red; font-weight: 600">
          {{ form.predict_time }}
        </span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveMain">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'预览'"
      :visible.sync="dialogPreviewVisible"
      width="800px"
      custom-class="dialog-preview"
      @close="close"
    >
      <el-table :data="previewData">
        <el-table-column
          prop="start_time"
          label="开始日期"
          width="300"
          align="center"
        >
          <template slot-scope="scope">
            {{ format(scope.row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="end_time"
          label="结束日期"
          width="300"
          align="center"
        >
          <template slot-scope="scope">
            {{ format(scope.row.end_time) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: right; padding: 10px 0px">
        总课时：
        <span style="color: red; font-weight: 600">
          {{ form.predict_time }}
        </span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveMain">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'编辑'"
      :visible.sync="dialogDescVisible"
      width="800px"
      custom-class="dialog-preview"
      @close="close"
    >
      <el-form ref="descForm" :model="descForm" label-width="120px">
        <el-form-item label="课程备注" prop="description">
          <div>
            <el-input
              v-model="descForm.description"
              type="textarea"
              :rows="2"
            />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="upDateDesc()">确 定</el-button>
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
          num_class: 1,
          predict_time: 0,
          classroom_id: '',
          type: 1,
          name: '',
          description: '',
          start_date: '',
          start_time: '',
          week_type: [],
          schedul_time: [],
          class_num: 1,
        },
        descForm: {
          description: '',
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
        dialogDescVisible: false,
        dialogConflictVisible: false,
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
        conflictData: [],
      }
    },
    created() {},
    mounted() {
      
    },
    methods: {
      showEdit(row) {
        this.getStudentList()
        this.getTeacherList()
        this.getSubjectList()
        this.getClassRoomList()
        if (!row) {
          this.title = '添加'
        } else {
          this.title = '编辑'
          this.form = Object.assign({}, row)
        }
        this.dialogFormVisible = true
      },
      showDescEdit(row) {
        this.descForm = Object.assign(
          {},
          {
            description: row.description,
            id: row.id,
          }
        )
        this.dialogDescVisible = true
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
          url: 'https://mastercenter.cn/api/classroom/list',
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
        this.handleClassNum()
      },

      getOneClassTimes() {
        const ONE_HOUR_TIME = 1000 * 60 * 60
        const wrapStartTime = this.previewData[0].start_time
        const wrapEndTime = this.previewData[0].end_time
        const diffClassTimes = Number(
          (
            (Number(wrapEndTime) - Number(wrapStartTime)) /
            ONE_HOUR_TIME
          ).toFixed(1)
        )
        return diffClassTimes
      },

      handleClassNum() {
        // 计算课时
        // 任取一个开始时间和结束时间
        const oneClassTimes = this.getOneClassTimes()
        const diffClassTimes = oneClassTimes * this.form.class_num
        this.form.predict_time = diffClassTimes
      },

      saveMain() {
        this.$nextTick(async () => {
          const num = this.getOneClassTimes()
          // 传给后端的时间戳转成unix
          const schedul_time = this.previewData.map((item) => {
            return {
              start_time: item.start_time / 1000,
              end_time: item.end_time / 1000,
              num,
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
          if (valid) {
            const schedul_time = []

            // 判断是什么类型
            const { type, start_date, start_time, class_num } = this.form
            const [begin, end] = start_time

            const [beginHour, beginMinute] = this.getHourAndMin(begin)
            const [endHour, endMinute] = this.getHourAndMin(end)
            const [year, month, day] = this.getYearAndMonthAndDay(start_date)

            const ONE_DAY_TIME = 1000 * 60 * 60 * 24
            const ONE_WEEK_TIME = ONE_DAY_TIME * 7

            if (type == 1) {
              // 天
              const startDayDate = new Date(
                year,
                month,
                day,
                beginHour,
                beginMinute
              ).getTime()
              const enDayDate = new Date(
                year,
                month,
                day,
                endHour,
                endMinute
              ).getTime()
              for (let i = 0; i < Number(class_num); i++) {
                schedul_time.push([
                  startDayDate + i * ONE_DAY_TIME,
                  enDayDate + i * ONE_DAY_TIME,
                ])
              }
            } else {
              // 周
              // 重新开始排序
              const sortWeekType = this.weekList.filter((item) => {
                return this.form.week_type.some(
                  (weekTypeItem) => item.name == weekTypeItem
                )
              })

              const wrapStartDate =
                new Date(start_date).getTime() - ONE_DAY_TIME

              let count = 0
              const fn = (startTime) => {
                for (let i of sortWeekType) {
                  // 拿到起始日期
                  const [year, month, day] = this.getYearAndMonthAndDay(
                    new Date(startTime + i.id * ONE_DAY_TIME)
                  )
                  const startDayDate = new Date(
                    year,
                    month,
                    day,
                    beginHour,
                    beginMinute
                  ).getTime()
                  const enDayDate = new Date(
                    year,
                    month,
                    day,
                    endHour,
                    endMinute
                  ).getTime()
                  schedul_time.push([startDayDate, enDayDate])
                  if (++count >= this.form.class_num) return
                }
                fn(startTime + ONE_WEEK_TIME)
              }
              fn(wrapStartDate)
            }

            this.form.schedul_time = schedul_time

            // 根据时间列表生成一份预览的table数据
            this.previewData = schedul_time.map((schedulItem) => {
              return {
                start_time: schedulItem[0],
                end_time: schedulItem[1],
              }
            })

            this.handleClassNum()
            this.dialogPreviewVisible = true
          } else {
            return false
          }
        })
      },

      async upDateDesc() {
        // descForm
        const result = await request({
          url: 'https://mastercenter.cn/api/schedul/arranging_modify',
          method: 'post',
          data: {
            ...this.descForm,
          },
        })
        
        if (result && result.data) {
          this.$baseMessage('修改完成', 'success')
          this.$refs['descForm'].resetFields()
          this.dialogDescVisible = false
          this.descForm = this.$options.data().descForm
          this.$emit('fetchData')
        }
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
