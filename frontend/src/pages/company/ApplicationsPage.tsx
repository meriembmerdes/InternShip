import{useEffect,useState}from'react';
import{applicationService,type Application,type ApplicationStatus}from'../../services/applicationService';

export default function ApplicationsPage(){
const[applications,setApplications]=useState<Application[]>([]);
const[loading,setLoading]=useState(true);
const[message,setMessage]=useState('');
const[error,setError]=useState('');

const loadApplications=async()=>{
try{setLoading(true);const data=await applicationService.getAll();setApplications(data);}
catch(error){console.error(error);setError('Impossible de charger les candidatures.');}
finally{setLoading(false);}
};

useEffect(()=>{loadApplications();},[]);

const updateStatus=async(id:string,status:ApplicationStatus)=>{
try{setMessage('');setError('');await applicationService.updateStatus(id,status);setMessage(status==='ACCEPTED'?'Candidature acceptée.':'Candidature refusée.');await loadApplications();}
catch(error){console.error(error);setError('Impossible de modifier la candidature.');}
};

const statusLabel=(status:ApplicationStatus)=>{
 if(status==='PENDING')return'En attente';
 if(status==='ACCEPTED')return'Acceptée';
 if(status==='REJECTED')return'Refusée';
return'Annulée';
};

const statusClass=(status:ApplicationStatus)=>{
 if(status==='PENDING')return'bg-yellow-100 text-yellow-700';
 if(status==='ACCEPTED')return'bg-green-100 text-green-700';
 if(status==='REJECTED')return'bg-red-100 text-red-700';
return'bg-gray-100 text-gray-700';
};

if(loading)return<div className="p-6">Chargement des candidatures...</div>;

return(
<div className="p-6">
<div className="mb-6">
<h1 className="text-3xl font-bold text-gray-800">Candidatures reçues</h1>
<p className="mt-2 text-gray-500">Consultez les candidatures reçues pour vos offres de stage.</p>
</div>
{message&&<div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">{message}</div>}
{error&&<div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</div>}
{applications.length===0?<div className="rounded-xl border bg-white p-8 text-center text-gray-500">Aucune candidature reçue.</div>:
<div className="space-y-4">
{applications.map(application=>(
<div key={application.id} className="rounded-xl border bg-white p-6 shadow-sm">
<div className="flex flex-col justify-between gap-4 md:flex-row">
<div>
<h2 className="text-xl font-semibold text-gray-800">{application.internship?.title||'Offre de stage'}</h2>
<p className="mt-1 text-sm text-gray-500">{application.internship?.domain}</p>
</div>
<span className={`h-fit rounded-full px-3 py-1 text-sm font-medium ${statusClass(application.status)}`}>{statusLabel(application.status)}</span>
</div>
<div className="mt-5 grid gap-4 md:grid-cols-2">
<div><p className="text-sm text-gray-500">Étudiant</p><p className="font-medium">{`${application.student?.firstName||''} ${application.student?.lastName||''}`.trim()||'Non renseigné'}</p></div>
<div><p className="text-sm text-gray-500">Téléphone</p><p className="font-medium">{application.student?.phone||'Non renseigné'}</p></div>
</div>
{application.motivationMessage&&<div className="mt-5"><p className="text-sm text-gray-500">Message de motivation</p><p className="mt-1 whitespace-pre-line text-gray-700">{application.motivationMessage}</p></div>}
{application.cvUrl&&<div className="mt-4"><a href={application.cvUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Voir le CV</a></div>}
{application.status==='PENDING'&&<div className="mt-6 flex gap-3">
<button onClick={()=>updateStatus(application.id,'ACCEPTED')} className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700">Accepter</button>
<button onClick={()=>updateStatus(application.id,'REJECTED')} className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700">Refuser</button>
</div>}
</div>
))}
</div>}
</div>
);
}