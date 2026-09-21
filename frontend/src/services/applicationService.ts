import api from './api';

export type ApplicationStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED';

export interface Application {
 id:string;
 studentId:string;
 internshipId:string;
 motivationMessage?:string;
 cvUrl?:string;
 status:ApplicationStatus;
 appliedAt:string;
 internship?:{
  id:string;
  title:string;
  description:string;
  domain:string;
  location?:string;
  company?:{companyName:string};
  supervisor?:{firstName:string;lastName:string};
 };
 student?:{
  firstName:string;
  lastName:string;
  phone?:string;
  institution?:string;
  specialty?:string;
  cvUrl?:string;
 };
}

export const applicationService={
 create:async(data:{internshipId:string;motivationMessage?:string;cvUrl?:string})=>{
  const {data:result}=await api.post<Application>('/applications',data);
  return result;
 },
 getMine:async()=>{
  const {data}=await api.get<Application[]>('/applications/mine');
  return data;
 },
 getAll:async()=>{
  const {data}=await api.get<Application[]>('/applications');
  return data;
 },
 getById:async(id:string)=>{
  const {data}=await api.get<Application>(`/applications/${id}`);
  return data;
 },
 updateStatus:async(id:string,status:Application['status'])=>{
  const {data}=await api.patch<Application>(`/applications/${id}/status`,{status});
  return data;
 },
 cancel:async(id:string)=>{
  const {data}=await api.delete<Application>(`/applications/${id}/cancel`);
  return data;
 }
};