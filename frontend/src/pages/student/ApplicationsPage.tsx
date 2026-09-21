import { useEffect,useState } from 'react';
import { applicationService,type Application } from '../../services/applicationService';

export default function ApplicationsPage(){
 const [applications,setApplications]=useState<Application[]>([]);
 const [loading,setLoading]=useState(true);

 const load=async()=>{
  try{setApplications(await applicationService.getMine());}
  finally{setLoading(false);}
 };

 useEffect(()=>{load();},[]);

 const cancel=async(id:string)=>{
  if(!window.confirm('Annuler cette candidature ?'))return;
  await applicationService.cancel(id);
  load();
 };

 if(loading)return <div className="p-6">Chargement...</div>;

 return(
  <div className="p-6">
   <h1 className="text-2xl font-bold mb-6">Mes candidatures</h1>
   {applications.length===0?<div className="bg-white p-6 rounded-xl">Aucune candidature.</div>:(
    <div className="space-y-4">
     {applications.map(application=>(
      <div key={application.id} className="bg-white rounded-xl shadow p-5">
       <div className="flex justify-between gap-4">
        <div>
         <h2 className="text-xl font-semibold">{application.internship?.title}</h2>
         <p className="text-gray-500">{application.internship?.domain}</p>
         <p className="mt-2">Déposée le : {new Date(application.appliedAt).toLocaleDateString()}</p>
        </div>
        <span className="font-semibold">{application.status}</span>
       </div>
       {application.motivationMessage&&<p className="mt-4">{application.motivationMessage}</p>}
    {application.status==='PENDING'&&(
        <button onClick={()=>cancel(application.id)} className="mt-4 px-4 py-2 rounded-lg border">
         Annuler
        </button>
       )}
      </div>
     ))}
    </div>
   )}
  </div>
 );
}