import {redirect} from "next/navigation";
import {requireUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import DashboardClient from "./view";
export default async function Dashboard(){const user=await requireUser();if(!user)redirect("/login");
const [learners,teachers,assessments,scores,settings]=await Promise.all([
prisma.learner.count({where:{status:"Active"}}),prisma.teacher.count(),
prisma.assessment.count({where:{deleted:false}}),prisma.score.count(),prisma.setting.findMany()
]);
const school=settings.find(x=>x.key==="school_name")?.value||"School";
return <DashboardClient user={user} stats={{learners,teachers,assessments,scores}} school={school}/>;}
