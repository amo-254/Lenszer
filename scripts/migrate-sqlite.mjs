import Database from "better-sqlite3";
import {PrismaClient} from "@prisma/client";
const file=process.argv[2]||"./cbe_pms.db";
const old=new Database(file,{readonly:true});
const prisma=new PrismaClient();
const rows=(table)=>old.prepare(`SELECT * FROM ${table}`).all();
const has=(r,k)=>Object.prototype.hasOwnProperty.call(r,k);
async function main(){
  const counts={};
  const users=rows("users"), teachers=rows("teachers"), learners=rows("learners"), assessments=rows("assessments"), scores=rows("scores");
  await prisma.$transaction(async tx=>{
    for(const r of users){await tx.user.upsert({where:{id:r.id},create:{id:r.id,username:r.username,passwordHash:r.password,role:r.role,forceReset:false},update:{username:r.username,passwordHash:r.password,role:r.role}});}
    for(const r of teachers){await tx.teacher.upsert({where:{id:r.id},create:{id:r.id,name:r.name,teacherNo:r.teacher_no,username:r.username},update:{name:r.name,teacherNo:r.teacher_no,username:r.username}});}
    for(const r of learners){await tx.learner.upsert({where:{id:r.id},create:{id:r.id,admissionNo:r.admission_no,name:r.name,className:r.class_name,stream:r.stream,parentPhone:r.parent_phone,assessmentNo:r.assessment_no,status:r.status||"Active",graduatingClass:r.graduating_class,graduationYear:r.graduation_year,gender:r.gender},update:{admissionNo:r.admission_no,name:r.name,className:r.class_name,stream:r.stream,parentPhone:r.parent_phone,assessmentNo:r.assessment_no,status:r.status||"Active",graduatingClass:r.graduating_class,graduationYear:r.graduation_year,gender:r.gender}});}
    for(const r of assessments){await tx.assessment.upsert({where:{id:r.id},create:{id:r.id,grade:r.grade,term:r.term,year:r.year,assessmentType:r.assessment_type,deadline:r.deadline,analyzed:!!r.analyzed,analyzedAt:r.analyzed_at,analysisCount:r.analysis_count||0,createdAt:r.created_at,deleted:!!r.deleted,deletedAt:r.deleted_at},update:{grade:r.grade,term:r.term,year:r.year,assessmentType:r.assessment_type,deadline:r.deadline,analyzed:!!r.analyzed,analyzedAt:r.analyzed_at,analysisCount:r.analysis_count||0,createdAt:r.created_at,deleted:!!r.deleted,deletedAt:r.deleted_at}});}
    for(const r of scores){await tx.score.upsert({where:{id:r.id},create:{id:r.id,learnerId:r.learner_id,learningArea:r.learning_area,score:r.score,maxScore:r.max_score,term:r.term,year:r.year,assessmentType:r.assessment_type,assessmentId:r.assessment_id,gradeAtAssessment:r.grade_at_assessment,streamAtAssessment:r.stream_at_assessment},update:{learnerId:r.learner_id,learningArea:r.learning_area,score:r.score,maxScore:r.max_score,term:r.term,year:r.year,assessmentType:r.assessment_type,assessmentId:r.assessment_id,gradeAtAssessment:r.grade_at_assessment,streamAtAssessment:r.stream_at_assessment}});}
    for(const r of rows("teacher_assignments")) await tx.teacherAssignment.upsert({where:{id:r.id},create:{id:r.id,teacherId:r.teacher_id,learningArea:r.learning_area,className:r.class_name,stream:r.stream},update:{teacherId:r.teacher_id,learningArea:r.learning_area,className:r.class_name,stream:r.stream}});
    for(const r of rows("class_teacher_assignments")) await tx.classTeacherAssignment.upsert({where:{id:r.id},create:{id:r.id,teacherId:r.teacher_id,className:r.class_name,stream:r.stream},update:{teacherId:r.teacher_id,className:r.class_name,stream:r.stream}});
    for(const r of rows("graduating_classes")) await tx.graduatingClass.upsert({where:{id:r.id},create:{id:r.id,label:r.label,graduationYear:r.graduation_year,createdAt:r.created_at},update:{label:r.label,graduationYear:r.graduation_year,createdAt:r.created_at}});
    for(const r of rows("graduating_class_members")) await tx.graduatingClassMember.upsert({where:{id:r.id},create:{id:r.id,graduatingClassId:r.graduating_class_id,learnerId:r.learner_id,originalGrade:r.original_grade,originalStream:r.original_stream},update:{graduatingClassId:r.graduating_class_id,learnerId:r.learner_id,originalGrade:r.original_grade,originalStream:r.original_stream}});
    for(const r of rows("settings")) await tx.setting.upsert({where:{key:r.key},create:{key:r.key,value:String(r.value??"")},update:{value:String(r.value??"")}});
  },{timeout:120000});
  console.log(JSON.stringify({migrated:{users:users.length,teachers:teachers.length,learners:learners.length,assessments:assessments.length,scores:scores.length,teacherAssignments:rows("teacher_assignments").length,classTeacherAssignments:rows("class_teacher_assignments").length,settings:rows("settings").length}},null,2));
}
main().catch(e=>{console.error("Migration failed:",e.message);process.exit(1)}).finally(async()=>{old.close();await prisma.$disconnect()});
