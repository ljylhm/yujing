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
            @change="onStudentChange($event)"
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
        <div
          v-if="remainCourse"
          style="margin: 0px 0px 20px 50px; line-height: 30px"
        >
          <span v-for="item in remainCourse" :key="item.id">
            {{ item.course_name }}:
            <span style="color: red">{{ item.total }}</span>
          </span>
        </div>
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
            <el-radio :label="3">双周</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="周类型"
          prop="week_type"
          v-if="form.type == 2 || form.type == 3"
        >
          <el-checkbox-group v-model="form.week_type" size="medium">
            <el-checkbox
              v-for="city in weekList"
              :label="city.name"
              :key="city.id"
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
            v-if="form.type == 2 || form.type == 3"
            v-model="form.start_date"
            type="week"
            format="yyyy 第 WW 周"
            placeholder="选择周"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="首节课时间" prop="start_time">
          <el-time-picker
            style="margin-right: 20px"
            v-model="form.start_time"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            format="HH:mm"
            value-format="HH:mm"
          ></el-time-picker>
          <el-time-picker
            v-model="form.end_time"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            format="HH:mm"
            value-format="HH:mm"
          ></el-time-picker>
          <!-- <el-time-select
            style="margin-right: 20px"
            @focus="setStartFocus"
            v-model="form.start_time"
            :picker-options="{
              start: '00:00',
              step: '00:05',
              end: '23:59',
            }"
            placeholder="开始时间"
          />
          <el-time-select
            v-model="form.end_time"
            @focus="setEndFocus"
            :picker-options="{
              start: '00:00',
              step: '00:05',
              end: '23:59',
            }"
            placeholder="结束时间"
          /> -->
        </el-form-item>
        <el-form-item label="课程数量" prop="class_num">
          <div style="width: 100px">
            <el-input v-model="form.class_num" min="1" type="number" />
          </div>
        </el-form-item>
        <el-form-item label="总课时" prop="class_num">
          <div style="width: 200px">
            <el-button size="small" type="primary" @click="countCourseTime">
              点击计算
            </el-button>
            <span style="color: red; margin-left: 10px">
              {{ dynamicCourse }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="万能时间" prop="is_time_check">
          <div>
            <el-checkbox v-model="form.is_time_check">是否勾选</el-checkbox>
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
      :title="'冲突预览'"
      :visible.sync="dialogConflictVisible"
      width="800px"
      custom-class="dialog-preview"
    >
      <el-table :data="conflictData">
        <el-table-column
          prop="start_time"
          label="开始日期"
          width="200"
          align="center"
        >
          <template slot-scope="scope">
            {{ format(scope.row.start_time * 1000) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="end_time"
          label="结束日期"
          width="200"
          align="center"
        >
          <template slot-scope="scope">
            {{ format(scope.row.end_time * 1000) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="key"
          label="冲突原因"
          align="center"
        ></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogConflictVisible = false">
          确 定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'预览'"
      :visible.sync="dialogPreviewVisible"
      width="800px"
      custom-class="dialog-preview"
    >
      <el-form ref="previewform" :model="previewform" label-width="120px">
        <el-form-item label="首节课开始时间" prop="start_date">
          <el-date-picker
            v-model="previewform.start_date"
            type="date"
            align="right"
            placeholder="开始日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="首节课时间" prop="start_time">
          <el-time-select
            style="margin-right: 20px"
            @focus="setStartFocusV2"
            v-model="previewform.start_time"
            :picker-options="{
              start: '00:00',
              step: '00:05',
              end: '23:59',
            }"
            placeholder="开始时间"
          />
          <el-time-select
            v-model="previewform.end_time"
            @focus="setEndFocusV2"
            :picker-options="{
              start: '00:00',
              step: '00:05',
              end: '23:59',
            }"
            placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="" prop="">
          <el-button type="primary" @click="addItemOne">添加</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="previewData">
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
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
              @click="handleDelete(scope.$index)"
              type="text"
              size="small"
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
          end_time: '',
          time_arr: [],
          week_type: [],
          schedul_time: [],
          class_num: 1,
          is_time_check: false, // 0就是默认检测  1就是不检测
        },
        previewform: {
          start_date: '',
          start_time: '',
          end_time: '',
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
          // start_time: [
          //   { required: true, trigger: 'change', message: '请选择开始时间' },
          // ],
          // end_time: [
          //   { required: true, trigger: 'change', message: '请选择结束时间' },
          // ],
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
        remainCourse: '',

        dynamicCourse: 0,
      }
    },
    created() {},
    mounted() {},
    methods: {
      setStartFocus() {
        if (!this.form.start_time) this.form.start_time = '08:00'
      },
      setEndFocus() {
        if (!this.form.end_time) this.form.end_time = '08:00'
      },
      setStartFocusV2() {
        if (!this.previewform.start_time) this.previewform.start_time = '08:00'
      },
      setEndFocusV2() {
        if (!this.previewform.end_time) this.previewform.end_time = '08:00'
      },
      addItemOne() {
        const schedul_time = []
        const ONE_DAY_TIME = 1000 * 60 * 60 * 24
        const ONE_WEEK_TIME = ONE_DAY_TIME * 7
        const ONE_HOUR_TIME = 1000 * 60 * 60

        // 判断是什么类型
        const { start_date, start_time, end_time } = this.previewform
        const begin = start_time
        const end = end_time
        if (!begin) {
          this.$message({
            message: '请填写首节课开始时间',
            type: 'warning',
          })
          return
        }
        if (!end) {
          this.$message({
            message: '请填写首节课结束时间',
            type: 'warning',
          })
          return
        }
        let num_begin = Number(begin.replace(':', '.'))
        let num_end = Number(end.replace(':', '.'))
        if (num_begin >= num_end) {
          this.$message({
            message: `开始时间${begin}不能大于结束时间${end}`,
            type: 'warning',
          })
          return
        }
        const [beginHour, beginMinute] = this.getHourAndMin(begin)
        const [endHour, endMinute] = this.getHourAndMin(end)
        const [year, month, day] = this.getYearAndMonthAndDay(start_date)

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

        const isRepeate = this.previewData.some((item) => {
          return item.start_time == startDayDate && item.end_time === enDayDate
        })

        if (isRepeate) {
          this.$baseMessage('已经有一条相同时间课时', 'warning')
        } else {
          this.previewData.push({
            start_time: startDayDate,
            end_time: enDayDate,
          })
          this.handleClassNum()
        }
      },
      async onStudentChange(value) {
        const result = await request({
          url: 'https://mastercenter.cn/api/user/get_schdule ',
          method: 'post',
          data: {
            student_id: value,
          },
        })
        if (result && result.data) {
          this.remainCourse = result.data.list
        }
      },
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
        // this.form.schedulItem.splice(index, 1)
        this.handleClassNum()
      },

      getOneClassTimes(item) {
        const ONE_HOUR_TIME = 1000 * 60 * 60
        const wrapStartTime = item.start_time
        const wrapEndTime = item.end_time
        const diffClassTimes = Number(
          (
            (Number(wrapEndTime) - Number(wrapStartTime)) /
            ONE_HOUR_TIME
          ).toFixed(1)
        )

        // 判断是否大于0.5
        let finialDiffClassTimes = diffClassTimes
        const diffClassTimesArr = diffClassTimes.toString().split('.')
        let prefixDiffClassTimes = Number(diffClassTimesArr[1])
        if (prefixDiffClassTimes > 0 && prefixDiffClassTimes <= 5) {
          diffClassTimesArr[1] = 5
          finialDiffClassTimes = Number(diffClassTimesArr.join('.'))
        } else if (prefixDiffClassTimes > 5) {
          finialDiffClassTimes = Math.round(diffClassTimes)
        }

        return finialDiffClassTimes
      },

      handleClassNum() {
        // 计算课时
        // 任取一个开始时间和结束时间
        if (this.previewData.length == 0) {
          this.form.predict_time = 0
        } else {
          const diffClassTimes = this.previewData.reduce((prev, current) => {
            return prev + this.getOneClassTimes(current)
          }, 0)
          // const diffClassTimes = oneClassTimes * this.previewData.length
          this.form.predict_time = diffClassTimes
        }
      },

      saveMain() {
        this.$nextTick(async () => {
          // const num = this.getOneClassTimes()
          // 传给后端的时间戳转成unix
          const schedul_time = this.previewData.map((item) => {
            return {
              start_time: item.start_time / 1000,
              end_time: item.end_time / 1000,
              num: this.getOneClassTimes(item),
            }
          })

          const result = await request({
            url: 'https://mastercenter.cn/api/schedul/add',
            method: 'post',
            data: {
              ...this.form,
              is_time_check: !!this.form.is_time_check, // 处理is_time_check
              schedul_time,
            },
          })
          if (result && result.code == '1007') {
            this.conflictData = result.data
            this.dialogConflictVisible = true
            return
          }
          if (result && result.data) {
            this.$baseMessage('添加成功', 'success')
            this.$refs['form'].resetFields()
            this.dialogFormVisible = false
            this.dialogPreviewVisible = false
            this.form = this.$options.data().form
          } else {
            // this.$baseMessage(result.msg || this.title + '失败', 'error')
          }
        })
      },

      onChangeOne() {
        this.countCourseTime()
      },

      // 计算课时时间
      countCourseTime() {
        const schedul_time = []
        const ONE_DAY_TIME = 1000 * 60 * 60 * 24
        const ONE_WEEK_TIME = ONE_DAY_TIME * 7
        const ONE_HOUR_TIME = 1000 * 60 * 60

        // 判断是什么类型
        const { type, start_date, start_time, end_time, class_num } = this.form
        const begin = start_time
        const end = end_time
        if (!begin) {
          this.$message({
            message: '请填写首节课开始时间',
            type: 'warning',
          })
          return
        }
        if (!end) {
          this.$message({
            message: '请填写首节课结束时间',
            type: 'warning',
          })
          return
        }
        let num_begin = Number(begin.replace(':', '.'))
        let num_end = Number(end.replace(':', '.'))
        if (num_begin >= num_end) {
          this.$message({
            message: `开始时间${begin}不能大于结束时间${end}`,
            type: 'warning',
          })
          return
        }
        // const [begin, end] = start_time
        const [beginHour, beginMinute] = this.getHourAndMin(begin)
        const [endHour, endMinute] = this.getHourAndMin(end)
        const [year, month, day] = this.getYearAndMonthAndDay(start_date)

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

        this.previewData.push({
          start_time: startDayDate,
          end_time: enDayDate,
        })

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
          const wrapStartDate = new Date(start_date).getTime() - ONE_DAY_TIME

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

            const t = type == 2 ? ONE_WEEK_TIME : ONE_WEEK_TIME * 2
            fn(startTime + t)
          }
          fn(wrapStartDate)
        }

        // this.form.schedul_time = schedul_time

        // 根据时间列表生成一份预览的table数据
        const previewData = schedul_time.map((schedulItem) => {
          return {
            start_time: schedulItem[0],
            end_time: schedulItem[1],
          }
        })

        if (previewData.length == 0) {
          this.dynamicCourse = 0
        } else {
          const diffClassTimes = previewData.reduce((prev, current) => {
            return prev + this.getOneClassTimes(current)
          }, 0)
          this.dynamicCourse = diffClassTimes
        }
      },

      save() {
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            const schedul_time = []
            const ONE_DAY_TIME = 1000 * 60 * 60 * 24
            const ONE_WEEK_TIME = ONE_DAY_TIME * 7
            const ONE_HOUR_TIME = 1000 * 60 * 60

            // 判断是什么类型
            const { type, start_date, start_time, end_time, class_num } =
              this.form
            const begin = start_time
            const end = end_time
            if (!begin) {
              this.$message({
                message: '请填写首节课开始时间',
                type: 'warning',
              })
              return
            }
            if (!end) {
              this.$message({
                message: '请填写首节课结束时间',
                type: 'warning',
              })
              return
            }
            let num_begin = Number(begin.replace(':', '.'))
            let num_end = Number(end.replace(':', '.'))
            if (num_begin >= num_end) {
              this.$message({
                message: `开始时间${begin}不能大于结束时间${end}`,
                type: 'warning',
              })
              return
            }
            // const [begin, end] = start_time
            const [beginHour, beginMinute] = this.getHourAndMin(begin)
            const [endHour, endMinute] = this.getHourAndMin(end)
            const [year, month, day] = this.getYearAndMonthAndDay(start_date)

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

            this.previewData.push({
              start_time: startDayDate,
              end_time: enDayDate,
            })

            // const hourClassNum =
            //   (wrapEnDayDate - wrapStartDayDate) / ONE_HOUR_TIME
            // console.log('hourClassNum', wrapEnDayDate, wrapStartDayDate, hourClassNum)
            // if (class_num % hourClassNum !== 0) {
            //   this.$baseMessage('课程数量和课程时间冲突，请重填', 'error')
            //   return
            // }

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

                const t = type == 2 ? ONE_WEEK_TIME : ONE_WEEK_TIME * 2
                fn(startTime + t)
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
