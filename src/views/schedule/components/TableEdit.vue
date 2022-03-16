<template>
  <div>
  <el-dialog
    :title="title"
    :visible.sync="dialogFormVisible"
    width="700px"
    @close="close"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="选择学生" prop="student_id">
        <el-select v-model="form.student_id" placeholder="请选择" :disabled="title == '编辑'">
           <el-option
            v-for="item in studentList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择老师" prop="teacher_id">
        <el-select v-model="form.teacher_id" placeholder="请选择" :disabled="title == '编辑'">
           <el-option
            v-for="item in teacherList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择科目" prop="course_id">
        <el-select v-model="form.course_id" placeholder="请选择" :disabled="title == '编辑'">
           <el-option
            v-for="item in subjectList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择教室" prop="classroom_id">
        <el-select v-model="form.classroom_id" placeholder="请选择" :disabled="title == '编辑'">
           <el-option
            v-for="item in classRoomList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="时间类型" prop="type" >
        <el-radio-group v-model="form.type">
          <el-radio :label="1">天</el-radio>
          <el-radio :label="2">周</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="周类型" prop="week_type" v-if="form.type == 2">
        <el-checkbox-group v-model="form.week_type" size="medium">
          <el-checkbox v-for="city in weekList" :label="city.name" :key="city.id">{{city.name}}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="首节课开始时间" prop="start_date" >
        <el-date-picker
          v-model="form.start_date"
          type="date"
          align="right"
          placeholder="开始日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="首节课时间" prop="start_time">
         <el-time-picker
            is-range
            v-model="form.start_time"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            format="HH:mm"
            value-format="HH:mm"
          >
         </el-time-picker>
      </el-form-item>
      <el-form-item label="课程数量" prop="predict_time">
        <div style="width:100px">
            <el-input v-model="form.predict_time" min=1 type="number" />
        </div>  
      </el-form-item>
      <el-form-item label="课程描述" prop="description" >
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
    :visible.sync="dialogPreviewVisible"
    width="800px"
    @close="close"
  >
    <el-table :data="previewData">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
         <el-table-column
            fixed="right"
            label="操作"
            width="100">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
              <el-button type="text" size="small">编辑</el-button>
            </template>
          </el-table-column>
    </el-table>
    
   </el-dialog>
</div>


</template>

<script>
  import { doEdit } from '@/api/table'
  import request from '@/utils/request'
  import { siteUrl } from '@/config'

  export default {
    name: 'TableEdit',
    data() {
      return {
        form: {
          student_id: "",
          course_id: "",
          teacher_id: "",
          num_class: 1,
          predict_time: 1,
          classroom_id: "",
          type: 1,
          name: '',
          description: '',
          start_date: "",
          start_time: "",
          week_type: []
        },
        rules: {
          student_id: [{ required: true, trigger: 'change', message: '请至少选择一个学生' }],
          course_id: [{ required: true, trigger: 'change', message: '请至少选择一个学科' }],
          teacher_id: [{ required: true, trigger: 'change', message: '请至少选择一个学科' }],
          classroom_id: [{ required: true, trigger: 'change', message: '请至少选择一个教室' }],
          start_date: [
            { required: true, trigger: 'change', message: '请选择开始日期' },
          ],
          start_time: [
            { required: true, trigger: 'change', message: '请选择开始时间' },
          ],
          week_type: [{ required: true, trigger: 'change', message: '请选择至少一个周类型' }],
        },
        title: '',
        dialogFormVisible: false,
        dialogPreviewVisible: false,
        studentList: [],
        teacherList: [],
        subjectList: [],
        classRoomList: [],
        weekList: [{
          id: 0,
          name: "星期一"
        },{
          id: 1,
          name: "星期二"
        },{
          id: 2,
          name: "星期三"
        },{
          id: 3,
          name: "星期四"
        },{
          id: 4,
          name: "星期五"
        },{
          id: 5,
          name: "星期六"
        },{
          id: 6,
          name: "星期天"
        }],
        previewData: [{
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
        }, {
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄'
        }]
      }
    },
    created() {},
    mounted(){
      console.log("this", this)
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
      close() {
        this.$refs['form'].resetFields()
        this.form = this.$options.data().form
        this.dialogFormVisible = false
        this.$emit('fetchData')
      },
      getHourAndMin(date){
        return [date.getHours(), date.getMinutes()]   
      },
      getYearAndMonthAndDay(date){
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      },
      // 获取学生的信息
      async getStudentList(){
         const result = await request({
              url: "https://mastercenter.cn/user/get_type_user_list",
              method: "post",
              data: {
                page: 1,
                limit: 1000,
                type: "1"
              }
          })
          if(result && result.data){
              this.studentList = result.data.list
          }
      },
      // 获取学生的信息
      async getTeacherList(){
         const result = await request({
              url: "https://mastercenter.cn/user/get_type_user_list",
              method: "post",
              data: {
                page: 1,
                limit: 1000,
                type: "3"
              }
          })
          if(result && result.data){
              this.teacherList = result.data.list
          }
      },
      // 获取科目的信息
      async getSubjectList(){
         const result = await request({
              url: "https://mastercenter.cn/course/list",
              method: "post",
              data: {
                page: 1,
                limit: 1000
              }
          })
          if(result && result.data){
              this.subjectList = result.data.list
          }
      },
      // 获取科目的信息
      async getClassRoomList(){
         const result = await request({
              url: "https://mastercenter.cn/classroom/list",
              method: "post",
              data: {
                page: 1,
                limit: 1000
              }
          })
          if(result && result.data){
              this.classRoomList = result.data.list
          }
      },
      
      save() {
        console.log("xxxx", this.form)
        this.$refs['form'].validate(async (valid) => {
          if (valid) {

            const previewData = []
            const schedul_time = []

            // 判断是什么类型
            const { type, start_date, start_time, predict_time } = this.form

            const [beginHour, beginMinute] = this.getHourAndMin(begin)
            const [endHour, endMinute] = this.getHourAndMin(end)
            const [year, month, day] = this.getYearAndMonthAndDay(start_date)

            const startDayDate = new Date(year, month, day, beginHour, beginMinute).getTime()
            const enDayDate = new Date(year, month, day, endHour, endMinute).getTime()
         
            if(type == 1){ // 天
                const ONE_DAY_TIME = 1000 * 60 * 60 * 24
                for(let i = 0; i < Number(predict_time); i++){
                       schedul_time.push([startDayDate + i * ONE_DAY_TIME, enDayDate + i * ONE_DAY_TIME])              
                }
            }else { // 周
                for(let i of this.weekList){
                    
                }
            }
            // const isEdit = this.title == "编辑"
            // const apiName = isEdit ? "update" : "class_add"
            // const result = await request({
            //   url: "https://mastercenter.cn/student/" + apiName,
            //   method: "post",
            //   data: {
            //     ...this.form
            //   }
            // })
            // if(result && result.data){
            //   this.$baseMessage(this.title + "成功", 'success')
            //   this.$refs['form'].resetFields()
            //   this.dialogFormVisible = false
            //   this.form = this.$options.data().form
            // }else{
            //   this.$baseMessage(result.msg ||  this.title + "失败", 'error')
            // }
          } else {
            return false
          }
        })
      },
    },
  }
</script>
